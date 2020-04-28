import { getCustomRepository, getRepository } from 'typeorm';
import TransactionsRepository from '../repositories/TransactionsRepository';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface RequestDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: RequestDTO): Promise<Transaction> {
    if (type !== 'income' && type !== 'outcome') {
      throw new AppError('Invalid type. ');
    }

    const transactionsRepository = getCustomRepository(TransactionsRepository);

    if (type === 'outcome') {
      const { total } = await transactionsRepository.getBalance();
      if (value > total) {
        throw new AppError('Do not have balance.');
      }
    }

    const categoryRepository = getRepository(Category);
    let entitycategory = await categoryRepository.findOne({
      where: { title: category },
    });
    if (!entitycategory) {
      entitycategory = categoryRepository.create({ title: category });
      await categoryRepository.save(entitycategory);
    }

    const transaciton = transactionsRepository.create({
      title,
      value,
      type,
      category: entitycategory,
    });
    await transactionsRepository.save(transaciton);

    return transaciton;
  }
}

export default CreateTransactionService;
