"use strict";

const util      = require('util');
const ffmpeg      = require('fluent-ffmpeg');
const spawn     = require('child_process').spawn;
const merge     = require('mout/object/merge');

const Server    = require('./_server');


class RpiServer extends Server {

  constructor(server, opts) {
    super(server, merge({
      fps : 12,
      ffmpeg: false,
      output: 'outputfile.mp4'
    }, opts));
  }

  get_feed() {
    const msk = "raspivid %s";
    const args = [
      '-t', '0',
      '-o', '-',
      '-w', this.options.width,
      '-h', this.options.height,
      '-fps', this.options.fps,
      '-pf', 'baseline',
      '-rot', this.options.rotate
    ];
    const cmd = util.format(msk, args.join(' '));
    console.log(cmd);
    const streamer = spawn('raspivid', args);
    streamer.on("exit", function(code){
      console.log("Failure", code);
    });
    if (this.options.ffmpeg) {
      console.log('Saving to', this.options.output);
      const command = ffmpeg({
        logger: 'debug'
      })
        .input(streamer.stdout)
        .on('error', function(err) {
          console.log('An error occurred: ' + err.message);
        })
        .on('end', function () {
          console.log('Finished FFMPEG output');
        })
        .output(this.options.output)
        .run();
      return command.pipe();
    }
    return streamer.stdout;
  }

};



module.exports = RpiServer;
