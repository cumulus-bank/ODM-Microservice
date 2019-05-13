import * as express from 'express';
import * as logger from 'morgan';
import * as bodyParser from 'body-parser';
import * as passport from 'passport'
import * as Request from 'request'
import * as epimetheus from 'epimetheus'

class App {
  public express: express.Application;
  constructor() {
    this.express = express();
    epimetheus.instrument(this.express)
    this.middleware();
    this.routes();
  }
  private middleware(): void {
    this.express.use(function (req, res, next) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "X-Requested-With,content-type,Content-Type, Access-Control-Allow-Headers, Authorization"); 
      res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE"); 
      next();
    });
    this.express.use(logger('dev'));
    this.express.use(bodyParser.json());
    this.express.use(passport.initialize());
    this.express.use(bodyParser.urlencoded({ extended: false }));
  }
  private routes(): void {
    let router = express.Router();
    router.post('/odm', (req, res, next) => {
      Request.post({
        headers: { "content-type": "application/json" },
        url: process.env.ODM,
        body: JSON.stringify({
          creditCard: {
            cardType: req.body.cardType,
            cardTier: req.body.cardTier,
            cardLimit: req.body.cardLimit,
            nameOnCard: req.body.nameOnCard,
            cardStatus: req.body.cardStatus,
            cardOffers: req.body.cardOffers
          }
        })
      }, (err, response, body) => {
        if (err) {
          res.status(404).json({ err });
          console.log(err);
        }
        res.json(JSON.parse(body));
      });
    });
    router.get('/healthz', (req, res, next) => {
      res.send('success');
    });
    this.express.use('/', router);
  }
}
export default new App().express;