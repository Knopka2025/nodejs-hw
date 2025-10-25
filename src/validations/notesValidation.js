import { Joi, Segments } from "celebrate";
import { isValidObjectId } from "mongoose";
import { TAGS } from "../constants/tags.js";

// Кастомна валідація ObjectId — коректно використовує isValidObjectId
const objectIdValidator = (value, helpers) => {
  return !isValidObjectId(value)
    ? helpers.message(`Invalid id format ${value}`)
    : value;
};

// noteIdSchema — параметр noteId валідований через кастомну функцію
export const noteIdSchema = {
  [Segments.PARAMS]: Joi.object({
    noteId: Joi.string().custom(objectIdValidator).required(),
  }),
};

// createNoteSchema — всі поля описані, з повідомленнями
export const createNoteSchema = {
  [Segments.BODY]: Joi.object({
    title: Joi.string().min(1).max(230).required().trim().messages({
      "string.base": "Title must be a string",
      "string.min": "Title should have at least {#limit} characters",
      "string.max": "Title should have at most {#limit} characters",
      "any.required": "Title is required",
    }),
    content: Joi.string().allow("").trim().messages({
      "string.base": "Content must be a string",
    }),
    tag: Joi.string().valid(...TAGS).trim().messages({
      "any.only": `Tag must be one of: ${TAGS.join(", ")}`,
    }), //  зроблено НЕОБОВ'ЯЗКОВИМ (убрано .required())
  }),
};

// updateNoteSchema — параметри і тіло валідовані
// .min(1) гарантує, що хоча б одне поле буде оновлено
export const updateNoteSchema = {
  [Segments.PARAMS]: Joi.object({
    noteId: Joi.string().custom(objectIdValidator).required(),
  }),
  [Segments.BODY]: Joi.object({
    title: Joi.string().min(1).max(230).trim(),
    content: Joi.string().allow("").trim(),
    tag: Joi.string().valid(...TAGS).trim(),
  }).min(1),
};

// getAllNotesSchema — пагінація, пошук, фільтрація
export const getAllNotesSchema = {
  [Segments.QUERY]: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    perPage: Joi.number().integer().min(5).max(20).default(10),
    search: Joi.string().allow("").trim(), // видалено обмеження .max(30)
    tag: Joi.string().valid(...TAGS).trim(),

  }),
};
