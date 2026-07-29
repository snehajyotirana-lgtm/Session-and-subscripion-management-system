import Client from '../models/Client.js';
import AppError from '../utils/AppError.js';
import { buildPaginationMeta, escapeRegex, getPagination } from '../utils/query.js';

const clientPopulate = {
  path: 'assignedTrainer',
  select: 'name email role',
};

export const listClients = async (query = {}) => {
  const { page, limit, skip } = getPagination(query);
  const filter = {};

  if (query.status) {
    filter.status = query.status;
  }

  if (query.assignedTrainer) {
    filter.assignedTrainer = query.assignedTrainer;
  }

  if (query.search) {
    const searchRegex = new RegExp(escapeRegex(query.search), 'i');
    filter.$or = [
      { firstName: searchRegex },
      { lastName: searchRegex },
      { email: searchRegex },
      { phone: searchRegex },
    ];
  }

  const [items, total] = await Promise.all([
    Client.find(filter)
      .populate(clientPopulate)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Client.countDocuments(filter),
  ]);

  return {
    items,
    meta: buildPaginationMeta({ total, page, limit }),
  };
};

export const getClientById = async (clientId) => {
  const client = await Client.findById(clientId).populate(clientPopulate);

  if (!client) {
    throw new AppError('Client not found.', 404);
  }

  return client;
};

export const createClient = async (payload) => Client.create(payload);

export const updateClient = async (clientId, payload) => {
  const client = await Client.findByIdAndUpdate(clientId, payload, {
    new: true,
    runValidators: true,
  }).populate(clientPopulate);

  if (!client) {
    throw new AppError('Client not found.', 404);
  }

  return client;
};

export const deleteClient = async (clientId) => {
  const client = await Client.findByIdAndDelete(clientId);

  if (!client) {
    throw new AppError('Client not found.', 404);
  }

  return client;
};
