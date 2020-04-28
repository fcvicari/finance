import path from 'path';
import fs from 'fs';
import csvParse from 'csv-parse';
import { getCustomRepository, getRepository, In } from 'typeorm';
import Category from '../models/Category';
import ConfigUpload from '../config/upload';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface RequestDTO {
  filename: string;
}

interface CSVTransaction {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  public async execute({ filename }: RequestDTO): Promise<Transaction[]> {
    const transacitonFilePath = path.join(
      ConfigUpload.file_destination,
      filename,
    );
    const readCSVStream = fs.createReadStream(transacitonFilePath);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const categories: string[] = [];
    const transactions: CSVTransaction[] = [];

    parseCSV.on('data', async line => {
      const [title, type, value, category] = line.map((cell: string) =>
        cell.trim(),
      );

      if (!title || !type || !value) return;

      categories.push(category);
      transactions.push({ title, type, value, category });
    });

    await new Promise(resolve => parseCSV.on('end', resolve));

    const categoryRepository = getRepository(Category);
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const categoriesExists = await categoryRepository.find({
      where: {
        title: In(categories),
      },
    });

    const categoriesTitle = categoriesExists.map(
      (category: Category) => category.title,
    );

    const addCategoriesTitle = categories
      .filter(category => !categoriesTitle.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index);

    const newCategories = categoryRepository.create(
      addCategoriesTitle.map(title => ({ title })),
    );

    await categoryRepository.save(newCategories);

    const totalCategories = [...categoriesExists, ...newCategories];

    const createTransactions = transactionsRepository.create(
      transactions.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: totalCategories.find(
          category => category.title === transaction.category,
        ),
      })),
    );

    await transactionsRepository.save(createTransactions);

    await fs.promises.unlink(transacitonFilePath);

    return createTransactions;
  }
}

export default ImportTransactionsService;
