import GridConversation from '../models/gridConversation.js';
import { getRAGChain } from '../services/ragService.js';
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { formatResponse, formatError } from '../utils/responseFormatter.js';

export const createGridConversation = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json(formatError('User ID is required'));
    }

    const conversation = await GridConversation.create({
      userId,
      topic: 'electrical_grid',
      messages: []
    });

    res.status(201).json(formatResponse(conversation, 'Grid conversation created successfully'));
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json(formatError(error.message));
  }
};

export const processGridMessage = async (req, res) => {
  try {
    const { question } = req.body;
    const { conversationId } = req.params;

    if (!question || !question.trim()) {
      return res.status(400).json(formatError('Question is required'));
    }

    const conversation = await GridConversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json(formatError('Conversation not found'));
    }

    const chatHistory = conversation.messages.map(msg =>
      msg.role === 'user' ? new HumanMessage(msg.content) : new AIMessage(msg.content)
    );

    const ragChain = getRAGChain();
    const response = await ragChain.invoke({
      input: question,
      chat_history: chatHistory,
    });

    const answer = response.answer;
    const sources = response.context.map(doc => ({
      collection: doc.metadata.collection,
      substationName: doc.metadata.substationName || doc.metadata.date,
      date: doc.metadata.date,
      source: doc.metadata.source,
      temperature: doc.metadata.temperature,
      totalUnitsConsumed: doc.metadata.totalUnitsConsumed
    }));

    conversation.messages.push(
      { role: 'user', content: question, timestamp: new Date() },
      { role: 'assistant', content: answer, sources, timestamp: new Date() }
    );
    await conversation.save();

    const responseData = {
      answer,
      sources,
      metadata: {
        totalSources: sources.length,
        collections: [...new Set(sources.map(s => s.collection))],
        conversationId,
        messageCount: conversation.messages.length
      }
    };

    res.json(formatResponse(responseData, 'Query processed successfully'));
  } catch (error) {
    console.error('Grid query error:', error);
    res.status(500).json(formatError('Failed to process grid query', error.message));
  }
};

export const getGridConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await GridConversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json(formatError('Conversation not found'));
    }

    res.json(formatResponse(conversation));
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json(formatError(error.message));
  }
};

export const getUserGridConversations = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const conversations = await GridConversation.find({ userId })
      .sort({ 'metadata.lastActivity': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('_id topic createdAt messages metadata');

    const conversationsWithSummary = conversations.map(conv => ({
      _id: conv._id,
      topic: conv.topic,
      createdAt: conv.createdAt,
      messageCount: conv.messages.length,
      lastActivity: conv.metadata.lastActivity,
      lastMessage: conv.messages.length > 0
        ? conv.messages[conv.messages.length - 1].content.substring(0, 100) + '...'
        : 'No messages'
    }));

    const total = await GridConversation.countDocuments({ userId });

    res.json(formatResponse({
      conversations: conversationsWithSummary,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalConversations: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    }));
  } catch (error) {
    console.error('Get user conversations error:', error);
    res.status(500).json(formatError(error.message));
  }
};

export const deleteGridConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await GridConversation.findByIdAndDelete(conversationId);
    if (!conversation) {
      return res.status(404).json(formatError('Conversation not found'));
    }

    res.json(formatResponse(null, 'Conversation deleted successfully'));
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json(formatError(error.message));
  }
};
