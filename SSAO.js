var FXStage = require('pex-fx/FXStage');
var fs = require('fs');

var VERT = fs.readFileSync(__dirname + '/ScreenImage.vert', 'utf8');
var FRAG = fs.readFileSync(__dirname + '/SSAO.frag', 'utf8');

FXStage.prototype.ssao = function (options) {
    var ctx = this.ctx;
    options = options || {};
    scale = options.scale !== undefined ? options.scale : 1;
    var outputSize = this.getOutputSize(options.width, options.height);
    var rt = this.getRenderTarget(outputSize.width, outputSize.height, options.depth, options.bpp);

    var program = this.getShader(VERT, FRAG);

    ctx.pushState(ctx.FRAMEBUFFER_BIT);
        ctx.bindFramebuffer(rt);

        ctx.bindTexture(this.getSourceTexture(options.depthMap), 0)
        ctx.bindTexture(this.getSourceTexture(options.normalMap), 1)
        ctx.bindTexture(options.kernelMap, 2)
        ctx.bindTexture(options.noiseMap, 3)

        ctx.bindProgram(program);
        program.setUniform('textureSize', [outputSize.width, outputSize.height]);
        program.setUniform('depthMap', 0);
        program.setUniform('normalMap', 1);
        program.setUniform('kernelMap', 2);
        program.setUniform('noiseMap', 3);
        //program.setUniform('strength', options.strength || 1);
        //program.setUniform('offset', options.offset || 0);
        program.setUniform('near', options.camera.getNear());
        program.setUniform('far', options.camera.getFar());
        program.setUniform('fov', options.camera.getFov());
        program.setUniform('aspectRatio', options.camera.getAspectRatio());
        program.setUniform('radius', options.radius || 0.2);

        this.drawFullScreenQuad(outputSize.width, outputSize.height, null, program);
    ctx.popState(ctx.FRAMEBUFFER_BIT);

    return this.asFXStage(rt, 'ssao');
};

FXStage.prototype.ssao.updateFrag = function(src) {
    FRAG = src;
}

module.exports = FXStage;
