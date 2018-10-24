// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityTypes, TurnContext, CardFactory } = require('botbuilder');
const { QnAMaker, QnAMakerEndpoint, QnAMakerOptions } = require('botbuilder-ai');
var builder = require('botbuilder');

/**
 * A simple bot that responds to utterances with answers from QnA Maker.
 * If an answer is not found for an utterance, the bot responds with help.
 */
class QnAMakerBot {
    /**
     * The QnAMakerBot constructor requires one argument (`endpoint`) which is used to create an instance of `QnAMaker`.
     * @param {QnAMakerEndpoint} endpoint The basic configuration needed to call QnA Maker. In this sample the configuration is retrieved from the .bot file.
     * @param {QnAMakerOptions} config An optional parameter that contains additional settings for configuring a `QnAMaker` when calling the service.
     */
    constructor(endpoint, qnaOptions) {
        this.qnaMaker = new QnAMaker(endpoint, qnaOptions);
    }

    /**
     * Every conversation turn for our QnAMakerBot will call this method.
     * There are no dialogs used, since it's "single turn" processing, meaning a single request and
     * response, with no stateful conversation.
     * @param {TurnContext} turnContext A TurnContext instance, containing all the data needed for processing the conversation turn.
     */
    async onTurn(turnContext) {
        // By checking the incoming Activity type, the bot only calls QnA Maker in appropriate cases.
        if (turnContext.activity.type === ActivityTypes.Message) {
            // Perform a call to the QnA Maker service to retrieve matching Question and Answer pairs.
            const qnaResults = await this.qnaMaker.generateAnswer(turnContext.activity.text);

            // If an answer was received from QnA Maker, send the answer back to the user.
            if (qnaResults[0]) {
                var isCardFormat = qnaResults[0].answer.includes(';');
                if(!isCardFormat){
                    // Not semi colon delimited, send a normal text response 
                    await turnContext.sendActivity(qnaResults[0].answer);
                } else {
                    
                    var qnaAnswer = qnaResults[0].answer;
                    
                    var qnaAnswerData = qnaAnswer.split(';');
                    var title = qnaAnswerData[0];
                    var description = qnaAnswerData[1];
                    var url = qnaAnswerData[2];
                    var imageURL = qnaAnswerData[3];
                    var buttonName = qnaAnswerData[4];

                   await turnContext.sendActivity({ attachments: [this.createHeroCard(title, description, url, imageURL, buttonName, 1)] });

                    
                    }
                    //await turnContext.sendActivity(msg);


            // If no answers were returned from QnA Maker, reply with help.
            } else {
                //await turnContext.sendActivity('No QnA Maker answers were found. But would you like to contact Stephan directly via email?"');
                await turnContext.sendActivity({ attachments: [this.createHeroCard('Sorry no QnA Maker answers were found', 'But would you like to contact Stephan directly via email?', 'mailto:stephan@cloudguy.pro', 'https://cdn.pixabay.com/photo/2016/01/10/22/52/letters-1132703_960_720.png', 'Hi', 2)] });
            }

        // If the Activity is a ConversationUpdate, send a greeting message to the user.
        } else if (turnContext.activity.type === ActivityTypes.ConversationUpdate &&
                   turnContext.activity.recipient.id !== turnContext.activity.membersAdded[0].id) {
            await turnContext.sendActivity('Welcome to the QnA Maker sample! Ask me a question and I will try to answer it.');

        // Respond to all other Activity types.
        } else if (turnContext.activity.type !== ActivityTypes.ConversationUpdate) {
            await turnContext.sendActivity(`[${ turnContext.activity.type }]-type activity detected.`);
        }
    }

    createHeroCard(title, description, url, imageURL, buttonName, actions) {
        if(actions==1){
            return CardFactory.heroCard(
                title,
                description,
                CardFactory.images([imageURL]),
                CardFactory.actions([
                    {
                        type: 'openUrl',
                        title: buttonName,
                        value: url
                    }
                ])
            ); 
        }
        
        else if (actions==2){
            return CardFactory.heroCard(
                title,
                description,
                CardFactory.images([imageURL]),
                CardFactory.actions([
                    {
                        type: 'openUrl',
                        title: 'Yes',
                        value: 'mailto:stephan@cloudguy.pro'
                    },
                    {
                        type: 'imBack',
                        title: 'No',
                        value: "Don't contact Stephan"
                    }
                ])
            );
        }

        
    }
}

module.exports.QnAMakerBot = QnAMakerBot;
