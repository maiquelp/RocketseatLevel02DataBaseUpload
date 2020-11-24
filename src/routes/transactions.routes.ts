import { Router } from 'express';
import { getCustomRepository } from 'typeorm';
import multer from 'multer';
import uploadConfig from '../configs/upload';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();

const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const transactions = await transactionsRepository.find(); 
    const balance = await transactionsRepository.getBalance();
    const consolidation = { transactions, balance }
    return response.json(consolidation);
});

transactionsRouter.post('/', async (request, response) => {
  try {
    const {title, value, type, category} = request.body;
    const createTransaction = new CreateTransactionService();
    const transaction = await createTransaction.execute({title, value, type, category})
    return response.json(transaction);
  } catch (error) {
    return response.status(400).json({message: error.message, status: 'error'});
  }
});

transactionsRouter.delete('/:id', async (request, response) => {
  try {
    const {id} = request.params;
    const deleteTransaction = new DeleteTransactionService();
    await deleteTransaction.execute(id);
    return response.status(204).send();
    
  } catch (error) {
    return response.status(400).json({message: error.message, status: 'error'});
  }

});

transactionsRouter.post('/import', upload.single('file'), async (request, response) => {
  try {
    const {filename, destination} = request.file;
    const importTransaction = new ImportTransactionsService();
    const transaction = await importTransaction.execute(filename, destination);
    return response.json(transaction);
  } catch (error) {
    return response.status(400).json({message: error.message, status: 'error'});
  }
  
});

export default transactionsRouter;
