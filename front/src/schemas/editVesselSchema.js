import Joi from "joi";

const editVesselSchema = Joi.object({
  name: Joi.string().required().messages({
    "any.required": "Name is required",
    "string.empty": "Name is required",
  }),

  type: Joi.string().required().messages({
    "any.required": "Ship type is required",
    "string.empty": "Ship type is required",
  }),

  country: Joi.string().required().messages({
    "any.required": "Country is required",
    "string.empty": "Country is required",
  }),
});

export default editVesselSchema;
