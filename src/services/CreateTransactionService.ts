import TransactionsRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';

interface TransacitonDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
}

class CreateTransactionService {
  private transactionsRepository: TransactionsRepository;

  constructor(transactionsRepository: TransactionsRepository) {
    this.transactionsRepository = transactionsRepository;
  }

  public execute({ title, value, type }: TransacitonDTO): Transaction {
    if (type !== 'outcome' && type !== 'income') {
      throw new Error('This type is not accept.');
    }

    if (type === 'outcome') {
      const { total } = this.transactionsRepository.getBalance();
      if (total < value) {
        throw new Error('Do not have balance.');
      }
    }

    const transaction = this.transactionsRepository.create({
      title,
      value,
      type,
    });

    return transaction;
  }
}

export default CreateTransactionService;
