import { config } from '../config/env.js';
import { analyzeFoodImage as analyzeFoodImageGemini, getAssistantReply as getAssistantReplyGemini } from './geminiService.js';
import { analyzeFoodImageGroq, getAssistantReplyGroq } from './groqService.js';

export const analyzeFoodImage = async (imageBuffer, mimeType) => {
  if (config.aiProvider === 'gemini') {
    return analyzeFoodImageGemini(imageBuffer, mimeType);
  }
  return analyzeFoodImageGroq(imageBuffer, mimeType);
};

// New: conversational voice assistant reply
export const getAssistantReply = async (message, conversationHistory) => {
  if (config.aiProvider === 'gemini') {
    return getAssistantReplyGemini(message, conversationHistory);
  }
  return getAssistantReplyGroq(message, conversationHistory);
};