import Joi from 'joi';

export function validate(schema) {
  return (req, res, next) => {
    const data = { body: req.body, params: req.params, query: req.query };
    const composed = Joi.object({ body: schema.body || Joi.any(), params: schema.params || Joi.any(), query: schema.query || Joi.any() });
    const { error, value } = composed.validate(data, { abortEarly: false, stripUnknown: true });
    if (error) return res.status(400).json({ error: 'Validation error', details: error.details?.map(d=>d.message) });
    req.body = value.body ?? req.body;
    req.params = value.params ?? req.params;
    req.query = value.query ?? req.query;
    next();
  };
}
