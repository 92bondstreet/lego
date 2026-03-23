import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

// We load json files as data source
import SALES from "./sources/vinted.json" with { type: "json" };

const PORT = 8092;

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(helmet());
app.use(cors())

app.get('/', (request, response) => {
  response.send({'ack': true});
});

app.get('/sales/search', (request, response) => {
  response.setHeader('Access-Control-Allow-Credentials', true)
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  response.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )

  try {
    const { legoSetId } = request.query;
    const result = SALES[legoSetId] || []

    return response.status(200).json({
      'success': true,
      'data': {'result': result}
    });
  } catch (error) {
    console.log(error);
    return response.status(404).send({
      'success': false,
      'data': {'result': []}
    });
  }
});


app.listen(PORT)

console.log(`📡 Running on port ${PORT}`);
