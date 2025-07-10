import Joi from "joi";

const resetPasswordSchema = Joi.object({
  oldPass: Joi.string().required().messages({
    "any.required": "Current password is required",
    "string.empty": "Current password is required",
  }),

  newPass: Joi.string()
    .min(8)
    .message("New password must be at least 8 characters long")
    .pattern(new RegExp("^(?=.*[a-z])"))
    .message("New password must contain at least one lowercase letter")
    .pattern(new RegExp("^(?=.*[A-Z])"))
    .message("New password must contain at least one uppercase letter")
    .pattern(new RegExp("^(?=.*\\d)"))
    .message("New password must contain at least one number")
    .required()
    .messages({
      "any.required": "New password is required",
      "string.empty": "New password is required",
    }),

  confirmNewPass: Joi.any()
    .equal(Joi.ref("newPass"))
    .required()
    .options({
      messages: {
        "any.only": "Passwords must match.",
      },
    }),
});

export default resetPasswordSchema;
