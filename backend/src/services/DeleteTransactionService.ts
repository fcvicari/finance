import { getCustomRepository } from 'typeorm';
import TransactionsRepository from '../repositories/TransactionsRepository';
import AppError from '../errors/AppError';

interface RequestDTO {
  id: string;
}

class DeleteTransactionService {
  public async execute({ id }: RequestDTO): Promise<null> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const transaction = await transactionsRepository.findOne(id);
    if (!transaction) {
      throw new AppError('Transaction does not exists.');
    }

    transactionsRepository.remove(transaction);

    return null;
  }
}

export default DeleteTransactionService;
