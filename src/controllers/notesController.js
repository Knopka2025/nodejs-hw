import { Note } from '../models/note.js';
import createHttpError from 'http-errors';

//  Отримати всі нотатки (з пошуком, фільтрацією, сортуванням і пагінацією)
export const getAllNotes = async (req, res, next) => {
	try {
		let {
			page = 1,
			perPage = 10,
			search,
			tag,
			sortBy = "_id",
			sortOrder = "asc"
		} = req.query;

		//  Перетворюємо параметри в числа
		page = Number(page);
		perPage = Number(perPage);
		const skip = (page - 1) * perPage;

		let notesQuery = Note.find();

		//  Використовуємо повнотекстовий пошук (MongoDB $text)
		if (search) {
			notesQuery = notesQuery.find({ $text: { $search: search } });
		}

		//  Фільтрація за тегом
		if (tag) {
			notesQuery = notesQuery.where("tag").equals(tag);
		}

		//  Виконуємо запит паралельно
		const [totalNotes, notes] = await Promise.all([
			notesQuery.clone().countDocuments(),
			notesQuery
				.skip(skip)
				.limit(perPage)
				.sort({ [sortBy]: sortOrder }),
		]);

		res.status(200).json({
			page,
			perPage,
			totalNotes,
			totalPages: Math.ceil(totalNotes / perPage),
			notes,
		});
	} catch (error) {
		next(error);
	}
};

//  Отримати нотатку за ID
export const getNoteById = async (req, res, next) => {
	const { noteId } = req.params;

	try {
		const note = await Note.findById(noteId);

		if (!note) {
			return next(createNotFoundError(noteId));
		}

		res.status(200).json(note);
	} catch (error) {
		next(error);
	}
};

//  Створити нову нотатку
export const createNote = async (req, res, next) => {
	try {
		const newNote = await Note.create(req.body);
		res.status(201).json(newNote);
	} catch (error) {
		next(error);
	}
};

//  Видалити нотатку за ID
export const deleteNote = async (req, res, next) => {
	const { noteId } = req.params;

	try {
		const deletedNote = await Note.findOneAndDelete({ _id: noteId });

		if (!deletedNote) {
			return next(createNotFoundError(noteId));
		}

		res.status(200).json(deletedNote);
	} catch (error) {
		next(error);
	}
};

//  Оновити нотатку за ID
export const updateNote = async (req, res, next) => {
	const { noteId } = req.params;

	try {
		const updatedNote = await Note.findOneAndUpdate(
			{ _id: noteId },
			req.body,
			{ new: true },
		);

		if (!updatedNote) {
			return next(createNotFoundError(noteId));
		}

		res.status(200).json(updatedNote);
	} catch (error) {
		next(error);
	}
};

//  Хелпер для 404-помилок
const createNotFoundError = (noteId) => {
	return createHttpError(404, `Note not found by id ${noteId}`);
};
