import sequelize from 'sequelize';
import express from 'express';

import Action from '../../models/Action';
import App from '../../models/App';

import ensureLoggedIn from '../../middlewares/ensureLoggedIn';
import generatePageList from '../../libs/generatePageList';

const meRouter = express.Router();

meRouter.get(['/apps'], ensureLoggedIn, (req, res, next) => {
  const currentPage = parseInt(req.query.page, 10) || 1;
  const limit = 24;
  const offset = (currentPage - 1) * limit;

  Action.findAll({
    attributes: [[sequelize.fn('DISTINCT', sequelize.col('appId')), 'appId'], 'createdAt'],
    where: { userId: req.user.id },
    offset,
    limit,
    order: [['createdAt', 'DESC']],
  })
  .then((actions) => {
    const opts = {
      where: {
        isActive: true,
        id: {
          $in: actions.map(action => action.appId),
        },
      },
    };

    return App.findAndCountAll(opts)
      .then(({ rows, count }) => {
        const totalPage = Math.ceil(count / limit);

        if (currentPage > totalPage && currentPage > 1) throw new Error('404');

        res.render('me/apps', {
          title: 'My Apps',
          apps: rows,
          currentPage,
          pages: generatePageList(currentPage, totalPage),
          totalPage,
          sort: opts.order ? req.query.sort : null,
        });
      })
      .catch(next);
  })
  .catch(next);
});

module.exports = meRouter;
