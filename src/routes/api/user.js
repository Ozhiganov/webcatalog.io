import express from 'express';
import passport from 'passport';
import crypto from 'crypto';
import errors from 'throw.js';
import bcrypt from 'bcryptjs';
import aws from 'aws-sdk';
import nodemailer from 'nodemailer';

import User from '../../models/user';

import isEmail from '../../libs/is-email';

const userApiRouter = express.Router();

const transporter = nodemailer.createTransport({
  SES: new aws.SES({
    apiVersion: '2010-12-01',
    region: 'us-east-1',
  }),
});

const generateTokenAsync = () =>
  new Promise((resolve, reject) => {
    crypto.randomBytes(20, (err, buf) => {
      if (err) {
        return reject(err);
      }

      const token = buf.toString('hex');
      return resolve(token);
    });
  });

const sendVerificationEmail = user =>
  generateTokenAsync()
    .then(token =>
      user.updateAttributes({
        verifyToken: token,
      })
        .then(() => transporter.sendMail({
          from: 'support@webcatalog.io',
          to: user.email,
          subject: 'WebCatalog Email Verification',
          // eslint-disable-next-line
          text: 'Please confirm that you want to use this as your WebCatalog account email address.\n\n' +
                'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                'https://webcatalog.io/auth/verify/' + token + '\n\n' +
                'If you did not request this, please ignore this email.\n',
        })));

userApiRouter.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      email: req.user.email,
      displayName: req.user.displayName,
      profilePicture: req.user.profilePicture,
      hasPassword: Boolean(req.user.password),
    },
  });
});

userApiRouter.patch('/', passport.authenticate('jwt', { session: false }), (req, res, next) => {
  if (!req.body) {
    return next(new errors.BadRequest());
  }

  if (req.body.email && !isEmail(req.body.email)) {
    return next(new errors.BadRequest());
  }

  return User.findById(req.user.id)
    .then((user) => {
      const newAttributes = {};
      if (req.body.email) {
        newAttributes.email = req.body.email;
        newAttributes.isVerified = false;
      }
      if (req.body.displayName) newAttributes.displayName = req.body.displayName;

      return user.updateAttributes(newAttributes)
        .then(() => res.json({
          user: {
            id: user.id,
            email: user.email,
            displayName: user.displayName,
            profilePicture: user.profilePicture,
            hasPassword: Boolean(user.password),
          },
        }));
    })
    .catch(next);
});

userApiRouter.patch('/password', passport.authenticate('jwt', { session: false }), (req, res, next) => {
  if (!req.body) return next(new errors.BadRequest());

  if (!req.body.currentPassword || !req.body.password) {
    return next(new errors.BadRequest());
  }

  if (req.body.password.length < 6) {
    return next(new errors.BadRequest('Password must have at least 6 characters.'));
  }

  return User.findById(req.user.id)
    .then(user =>
      Promise.resolve()
        .then(() => {
          if (user.password) {
            return bcrypt.compare(req.body.currentPassword, user.password);
          }
          return true;
        })
        .then((isValid) => {
          if (isValid === false) {
            return Promise.reject(new errors.CustomError('WrongPassword', 'Incorrect password.'));
          }

          const newAttributes = {
            password: req.body.password,
          };

          return user.updateAttributes(newAttributes)
            .then(() => res.json({
              success: true,
            }));
        }))
    .catch(next);
});


userApiRouter.post('/', (req, res, next) => {
  if (!req.body) return next(new errors.BadRequest());

  if (!req.body.email || !req.body.password || !isEmail(req.body.email)) {
    return next(new errors.BadRequest());
  }

  if (req.body.password.length < 6) {
    return next(new errors.CustomError('bad_request', 'Password must have at least 6 characters.'));
  }

  return User.findOne({ where: { email: req.body.email } })
    .then((user) => {
      if (user) {
        return Promise.reject(new errors.CustomError('email_taken', 'The email is already taken.'));
      }

      return bcrypt.hash(req.body.password, 10);
    })
    .then(hash =>
      User.create({
        email: req.body.email,
        password: hash,
        isVerified: false,
      }))
    .then((user) => {
      // sendVerificationEmail after signing up
      sendVerificationEmail(user);

      return res.json({
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          profilePicture: user.profilePicture,
          hasPassword: Boolean(user.password),
        },
      });
    })
    .then(() => next())
    .catch(next);
});

userApiRouter.patch('/', passport.authenticate('jwt', { session: false }), (req, res, next) => {
  if (!req.body) {
    return next(new errors.BadRequest());
  }

  return User.findById(req.user.id)
    .then((user) => {
      const newAttributes = {};
      if (req.body.email) {
        newAttributes.email = req.body.email;
        newAttributes.isVerified = false;
      }
      if (req.body.displayName) newAttributes.displayName = req.body.displayName;

      return user.updateAttributes(newAttributes)
        .then(() => {
          res.json({
            user: {
              id: user.id,
              email: user.email,
              displayName: user.displayName,
              profilePicture: user.profilePicture,
              hasPassword: Boolean(user.password),
            },
          });
        });
    });
});

export default userApiRouter;
