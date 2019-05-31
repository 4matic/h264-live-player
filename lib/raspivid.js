"use strict";

const util      = require('util');
const ffmpeg      = require('ffmpeg');
const spawn     = require('child_process').spawn;
const merge     = require('mout/object/merge');

const Server    = require('./_server');


class RpiServer extends Server {

  constructor(server, opts) {
    super(server, merge({
      fps : 12,
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
    ffmpeg(streamer.stdout, {
      logger: 'debug'
    }).output(this.options.output);

    return streamer.stdout;
  }

};



module.exports = RpiServer;
