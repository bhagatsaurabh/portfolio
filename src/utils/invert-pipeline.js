import Phaser from "phaser";

export class InvertPipeline extends Phaser.Renderer.WebGL.Pipelines
  .MultiPipeline {
  constructor(game) {
    super({
      game,
      fragShader: `
          precision mediump float;

          uniform sampler2D uMainSampler;
          varying vec2 outTexCoord;

          void main(void) {
              vec4 color = texture2D(uMainSampler, outTexCoord);
              if (color.a == 0.0) {
                discard;
              }
              gl_FragColor = vec4(1.0 - color.rgb, color.a);
          }
          `,
    });
  }
}
