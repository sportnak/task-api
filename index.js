const { exec } = require('child_process');
var express = require('express');
var https = require('https');
var BodyParser = require('body-parser');

const addTask = (command, sync) => {
  exec('/usr/local/bin/task ' + command, (err, stdout, stderr) => {
    if (err) {
      return { err };
    }

    console.log(stdout);

    // the *entire* stdout and stderr (buffered)
    if (sync) {
      exec('/usr/local/bin/task sync', (err, stdout, stderr) => {
        if (stderr) {
          console.log(stderr);
        }

        return { success: stdout };
      });
    }
  });
}

const taskLoad = (callback) => {
  exec('/usr/local/bin/task 1-10 export', (err, stdout, stderr) => {
    if (err) {
      console.log(err);
      return callback({ err });
    }

    return callback(JSON.parse(stdout));
  });
}

const app = express();

app.use(BodyParser.urlencoded({ extended: true }));
app.use(BodyParser.json());

app.post('/add', (req, res) => {
  const result = addTask(req.body.command, req.body.sync);
  if (result == null) {
    return res.status(200).send();
  }

  res.json(JSON.stringify(result.err));
});

app.get('/page', (req, res) => {
  taskLoad((load) => {
    if (load.err) {
      return res.status(500).send();
    }

    return res.json(load);
  });
});

app.get('/*', (req, res) => {
  res.send('go away');
});


const httpServer = app.listen(3000, () => {
  const host = httpServer.address().address;
  const port = httpServer.address().port;

  console.log('task api is listening at http://%s:%s', host, port);
});