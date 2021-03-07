import { MessageLocation } from './enums/message-location';
import { Message, MessageOptions, MessagePath, MessagePathFilter, SendMessageParams } from './interfaces/message.interface';
import { callbackToPromise, checkChrome, getCurrentTab } from './lib/helpers';

/** Sends message to the background script */
export function sendMessageToBackground(message: any, source: MessageLocation, messageOptions?: MessageOptions, filters?: MessagePathFilter) {
    return sendMessageTo(message, { source, destination: MessageLocation.Background, ...filters }, messageOptions);
}

/** Sends message to the options page */
export function sendMessageToOptions(message: any, source: MessageLocation, messageOptions?: MessageOptions, filters?: MessagePathFilter) {
    return sendMessageTo(message, { source, destination: MessageLocation.Options, ...filters }, messageOptions);
}

/** Sends message to the popup page */
export function sendMessageToPopup(message: any, source: MessageLocation, messageOptions?: MessageOptions, filters?: MessagePathFilter) {
    return sendMessageTo(message, { source, destination: MessageLocation.Popup, ...filters }, messageOptions);
}

/** Sends message to a specific content script */
export function sendMessageToContentScript(tabId: number, message: any, source: MessageLocation, messageOptions?: MessageOptions, filters?: MessagePathFilter) {
    return sendMessageTo(message, { source, destination: MessageLocation.Content, ...filters }, messageOptions, tabId);
}

/** Sends message to a the currently active webpage/content script */
export async function sendMessageToCurrentWebPage(message: any, source: MessageLocation, messageOptions?: MessageOptions, filters?: MessagePathFilter) {
    return sendMessageTo(message, { source, destination: MessageLocation.Content, ...filters }, messageOptions, (await getCurrentTab()).id);
}

/** Sends message to a custom location */
export function sendMessageTo(message: Message, path: MessagePath, messageOptions?: MessageOptions, tabId?: number): Promise<any> {
    let messageToSend = Object.assign(message, path);
    if (messageOptions?.extensionId) {
        return sendMessage(messageOptions.extensionId, messageToSend, messageOptions?.options);
    }

    if (tabId) {
        return sendMessageFromTab(tabId, messageToSend, messageOptions?.options);
    }

    return sendMessage(messageToSend, messageOptions?.options);
}

function sendMessage(...args: SendMessageParams): Promise<any> {
    const runtimeType = globalThis.browser ?? globalThis.chrome;
    if (checkChrome()) {
        return callbackToPromise(runtimeType.runtime.sendMessage, args);
    }
    return runtimeType.runtime.sendMessage(args);
}

function sendMessageFromTab(tabId: number, ...args: SendMessageParams): Promise<any> {
    const runtimeType = globalThis.browser ?? globalThis.chrome;
    if (checkChrome()) {
        return callbackToPromise(runtimeType.tabs.sendMessage, [tabId, ...args]);
    }
    return runtimeType.tabs.sendMessage(tabId, args);
}