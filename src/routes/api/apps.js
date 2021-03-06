import express from 'express';
import errors from 'throw.js';

import App from '../../models/app';
import categories from '../../constants/categories';

const appApiRouter = express.Router();

const unretrievableAttributes = ['installCount', 'isActive', 'updatedAt', 'createdAt'];

appApiRouter.get('/', (req, res, next) => {
  const currentPage = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 24;
  const offset = (currentPage - 1) * limit;

  if (limit > 100) {
    return next(new errors.BadRequest('Maximum limit: 100'));
  }

  const opts = {
    attributes: ['id', 'slug', 'name', 'url', 'version'],
    where: { isActive: true },
  };

  if (req.query.ids) {
    opts.where.id = {
      $in: req.query.ids.split(','),
    };
  } else {
    opts.offset = offset;
    opts.limit = limit;

    if (req.query.category && categories.indexOf(req.query.category) > -1) {
      opts.where.category = req.query.category;
    }
  }

  switch (req.query.sort) {
    case 'createdAt': {
      // default DESC
      const direction = req.query.order === 'asc' ? 'ASC' : 'DESC';

      opts.order = [['createdAt', direction]];
      break;
    }
    case 'name': {
      // default ASC
      const direction = req.query.order === 'desc' ? 'DESC' : 'ASC';

      opts.order = [['name', direction], ['createdAt', 'DESC']];
      break;
    }
    default: {
      // default DESC
      const direction = req.query.order === 'asc' ? 'ASC' : 'DESC';

      opts.order = [['installCount', direction], ['createdAt', 'DESC']];
    }
  }

  return App.findAndCountAll(opts)
    .then(({ rows, count }) => {
      const totalPage = Math.ceil(count / limit);

      if (currentPage > totalPage && currentPage > 1) throw new errors.NotFound();

      return res.json({
        apps: rows,
        totalPage,
      });
    })
    .catch(next);
});

appApiRouter.get('/:id', (req, res, next) => {
  const { id } = req.params;

  return App.find({
    attributes: { exclude: unretrievableAttributes },
    where: { id, isActive: true },
  })
    .then((app) => {
      if (!app) throw new errors.NotFound();

      return res.json({ app });
    })
    .catch(next);
});

export default appApiRouter;
