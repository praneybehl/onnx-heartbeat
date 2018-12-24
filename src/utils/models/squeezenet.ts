import ndarray from 'ndarray';
import ops from 'ndarray-ops';
import { Tensor } from 'onnxjs';
import { imagenetUtils, mathUtils } from '../../utils/index';

export function preProcess(ctx: CanvasRenderingContext2D): Tensor {
    const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    const { data, width, height } = imageData;
    // data processing
    const dataTensor = ndarray(new Float32Array(data), [width, height, 4]);
    const dataProcessedTensor = ndarray(new Float32Array(width * height * 3), [1, 3, width, height]);
    ops.assign(dataProcessedTensor.pick(0, 0, null, null), dataTensor.pick(null, null, 2));
    ops.assign(dataProcessedTensor.pick(0, 1, null, null), dataTensor.pick(null, null, 1));
    ops.assign(dataProcessedTensor.pick(0, 2, null, null), dataTensor.pick(null, null, 0));
    ops.divseq(dataProcessedTensor, 255);
    ops.subseq(dataProcessedTensor.pick(0, 0, null, null), 0.485);
    ops.subseq(dataProcessedTensor.pick(0, 1, null, null), 0.456);
    ops.subseq(dataProcessedTensor.pick(0, 2, null, null), 0.406);
    ops.divseq(dataProcessedTensor.pick(0, 0, null, null), 0.229);
    ops.divseq(dataProcessedTensor.pick(0, 1, null, null), 0.224);
    ops.divseq(dataProcessedTensor.pick(0, 2, null, null), 0.225);
    const tensor = new Tensor(new Float32Array(width * height * 3), 'float32', [1, 3, width, height]);
    (tensor.data as Float32Array).set(dataProcessedTensor.data);
    return tensor;
  }

export function getPredictedClass(res: Float32Array): {} {
  if (!res || res.length === 0) {
    const empty = [];
    for (let i = 0; i < 5; i++) {
      empty.push({ 
        name: '-',
        probability: 0,
        index: 0
      });
    }
    return empty;
  }
  const output = mathUtils.softmax(Array.prototype.slice.call(res));
  return imagenetUtils.imagenetClassesTopK(output, 5);
}