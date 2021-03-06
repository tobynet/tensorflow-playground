/* Copyright 2016 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
==============================================================================*/

/**
 * A two dimensional example: x and y coordinates with the label.
 */
export type Example2D = {
  x: number,
  y: number,
  label: number
};

type Point = {
  x: number,
  y: number
};

/**
 * Shuffles the array using Fisher-Yates algorithm. Uses the seedrandom
 * library as the random generator.
 */
export function shuffle(array: any[]): void {
  let counter = array.length;
  let temp = 0;
  let index = 0;
  // While there are elements in the array
  while (counter > 0) {
    // Pick a random index
    index = Math.floor(Math.random() * counter);
    // Decrease counter by 1
    counter--;
    // And swap the last element with it
    temp = array[counter];
    array[counter] = array[index];
    array[index] = temp;
  }
}

export type DataGenerator = (numSamples: number, noise: number) => Example2D[];

export function classifyTwoGaussData(numSamples: number, noise: number):
    Example2D[] {
  let points: Example2D[] = [];

  let varianceScale = d3.scale.linear().domain([0, .5]).range([0.5, 4]);
  let variance = varianceScale(noise);

  function genGauss(cx: number, cy: number, label: number) {
    for (let i = 0; i < numSamples / 2; i++) {
      let x = normalRandom(cx, variance);
      let y = normalRandom(cy, variance);
      points.push({x: x, y: y, label: label});
    }
  }

  genGauss(2, 2, 1); // Gaussian with positive examples.
  genGauss(-2, -2, -1); // Gaussian with negative examples.
  return points;
}

export function regressPlane(numSamples: number, noise: number):
  Example2D[] {
  let radius = 6;
  let labelScale = d3.scale.linear()
    .domain([-10, 10])
    .range([-1, 1]);
  let getLabel = (x, y) => labelScale(x + y);

  let points: Example2D[] = [];
  for (let i = 0; i < numSamples; i++) {
    let x = randUniform(-radius, radius);
    let y = randUniform(-radius, radius);
    let noiseX = randUniform(-radius, radius) * noise;
    let noiseY = randUniform(-radius, radius) * noise;
    let label = getLabel(x + noiseX, y + noiseY);
    points.push({x: x, y: y, label: label});
  }
  return points;
}

export function regressGaussian(numSamples: number, noise: number):
  Example2D[] {
  let points: Example2D[] = [];

  let labelScale = d3.scale.linear()
    .domain([0, 2])
    .range([1, 0])
    .clamp(true);

  let gaussians = [
    [-4, 2.5, 1],
    [0, 2.5, -1],
    [4, 2.5, 1],
    [-4, -2.5, -1],
    [0, -2.5, 1],
    [4, -2.5, -1]
  ];

  function getLabel(x, y) {
    // Choose the one that is maximum in abs value.
    let label = 0;
    gaussians.forEach(([cx, cy, sign]) => {
      let newLabel = sign * labelScale(dist({x: x, y: y}, {x: cx, y: cy}));
      if (Math.abs(newLabel) > Math.abs(label)) {
        label = newLabel;
      }
    });
    return label;
  }
  let radius = 6;
  for (let i = 0; i < numSamples; i++) {
    let x = randUniform(-radius, radius);
    let y = randUniform(-radius, radius);
    let noiseX = randUniform(-radius, radius) * noise;
    let noiseY = randUniform(-radius, radius) * noise;
    let label = getLabel(x + noiseX, y + noiseY);
    points.push({x: x, y: y, label: label});
  };
  return points;
}

export function classifySpiralData(numSamples: number, noise: number):
    Example2D[] {
  let points: Example2D[] = [];
  let n = numSamples / 2;

  function genSpiral(deltaT: number, label: number) {
    for (let i = 0; i < n; i++) {
      let r = i / n * 5;
      let t = 1.75 * i / n * 2 * Math.PI + deltaT;
      let x = r * Math.sin(t) + randUniform(-1, 1) * noise;
      let y = r * Math.cos(t) + randUniform(-1, 1) * noise;
      points.push({x: x, y: y, label: label});
    }
  }

  genSpiral(0, 1); // Positive examples.
  genSpiral(Math.PI, -1); // Negative examples.
  return points;
}

export function classifyCircleData(numSamples: number, noise: number):
    Example2D[] {
  let points: Example2D[] = [];
  let radius = 5;
  function getCircleLabel(p: Point, center: Point) {
    return (dist(p, center) < (radius * 0.5)) ? 1 : -1;
  }

  // Generate positive points inside the circle.
  for (let i = 0; i < numSamples / 2; i++) {
    let r = randUniform(0, radius * 0.5);
    let angle = randUniform(0, 2 * Math.PI);
    let x = r * Math.sin(angle);
    let y = r * Math.cos(angle);
    let noiseX = randUniform(-radius, radius) * noise;
    let noiseY = randUniform(-radius, radius) * noise;
    let label = getCircleLabel({x: x + noiseX, y: y + noiseY}, {x: 0, y: 0});
    points.push({x: x, y: y, label: label});
  }

  // Generate negative points outside the circle.
  for (let i = 0; i < numSamples / 2; i++) {
    let r = randUniform(radius * 0.7, radius);
    let angle = randUniform(0, 2 * Math.PI);
    let x = r * Math.sin(angle);
    let y = r * Math.cos(angle);
    let noiseX = randUniform(-radius, radius) * noise;
    let noiseY = randUniform(-radius, radius) * noise;
    let label = getCircleLabel({x: x + noiseX, y: y + noiseY}, {x: 0, y: 0});
    points.push({x: x, y: y, label: label});
  }
  return points;
}

export function classifyXORData(numSamples: number, noise: number):
    Example2D[] {
  function getXORLabel(p: Point) { return p.x * p.y >= 0 ? 1 : -1; }

  let points: Example2D[] = [];
  for (let i = 0; i < numSamples; i++) {
    let x = randUniform(-5, 5);
    let padding = 0.3;
    x += x > 0 ? padding : -padding;  // Padding.
    let y = randUniform(-5, 5);
    y += y > 0 ? padding : -padding;
    let noiseX = randUniform(-5, 5) * noise;
    let noiseY = randUniform(-5, 5) * noise;
    let label = getXORLabel({x: x + noiseX, y: y + noiseY});
    points.push({x: x, y: y, label: label});
  }
  return points;
}

export function classifyOxtuData(numSamples: number, noise: number):
    Example2D[] {

  const props = [
    // character of o
    {label: 1,  ratio: 1.0,   p0: {x: -4.0, y: 3.0},    p1: {x: 1.5,  y: 3.0}}, 
    {label: 1,  ratio: 1.0,   p0: {x: -0.8, y: 4.5},    p1: {x: -0.8, y: -2.0}}, 
    {label: 1,  ratio: 0.08,  p0: {x: -0.9, y: -1.6},   p1: {x: -2.0, y: -1.0}},
    {label: -1, ratio: 0.8,   p0: {x: -1.6, y: 2.0},    p1: {x: -4.0, y: -1.0}},

    // // character of xtu
    {label: -1, ratio: 0.2,   p0: {x: 1.7, y: -1.5},    p1: {x: 2.2, y: -2.5}}, 
    {label: -1, ratio: 0.2,   p0: {x: 3.0, y: -1.0},    p1: {x: 3.5, y: -2.0}}, 
    {label: 1,  ratio: 0.2,   p0: {x: 5.0, y: -1.0},    p1: {x: 4.7, y: -3.0}},
    {label: 1,  ratio: 0.3,   p0: {x: 4.7, y: -3.0},    p1: {x: 2.0, y: -4.6}},
  ];

  return makeClassifyDataWithLines(numSamples, noise, props);
}

export function classifyJavaData(numSamples: number, noise: number):
    Example2D[] {

  let props = [
    // character of di
    {label: 1,  ratio: 1.0,   p0: {x: -4.0, y: 0.5},    p1: {x: -3.0, y: 0.0}}, 
    {label: -1, ratio: 1.0,   p0: {x: -4.0, y: 2.0},    p1: {x: -3.0, y: 1.0}}, 
    {label: -1, ratio: 1.5,   p0: {x: -1.0, y: 1.0},    p1: {x: -2.0, y: -1.0}},
    {label: -1, ratio: 1.5,   p0: {x: -4.0, y: -1.7},   p1: {x: -2.0, y: -1.0}},
    {label: 1,  ratio: 0.5,   p0: {x: -2.0, y: 3.0},    p1: {x: -2.0, y: 2.0}}, 
    {label: -1, ratio: 0.5,   p0: {x: -1.0, y: 3.0},    p1: {x: -1.0, y: 2.0}}, 

    // character of xya
    {label: -1, ratio: 1.0,   p0: {x: -1.5, y: -3.5},   p1: {x: 0.5, y: -2.5}}, 
    {label: -1, ratio: 0.5,   p0: {x: -0.0, y: -3.5},   p1: {x: 0.5, y: -2.5}}, 
    {label:  1, ratio: 0.8,   p0: {x: -1.2, y: -2.0},   p1: {x: -0.4, y: -4.5}},

    // character of ba
    {label: 1,  ratio: 0.5,   p0: {x: 2.0, y: 1.0},     p1: {x: 2.0, y: 0.0}},
    {label: 1,  ratio: 1.0,   p0: {x: 1.0, y: -2.0},    p1: {x: 2.0, y: 0.0}},
    {label: -1, ratio: 1.5,   p0: {x: 3.5, y: 1.0},     p1: {x: 4.5, y: -2.0}}, 
    {label: 1,  ratio: 0.5,   p0: {x: 3.0, y: 3.0},     p1: {x: 3.0, y: 2.0}}, 
    {label: -1, ratio: 0.5,   p0: {x: 4.0, y: 3.0},     p1: {x: 4.0, y: 2.0}}, 
  ];

  return makeClassifyDataWithLines(numSamples, noise, props);
}


interface PropertyForLines {
  label: number;
  ratio: number;
  p0: Point 
  p1: Point;
};

function makeClassifyDataWithLines(numSamples: number, noise: number, props: PropertyForLines[], randRadius: number = 3):
    Example2D[] {

  const sumOfRatio = props.reduce((sum,x) => sum + x.ratio, 0);

  let points: Example2D[] = [];

  for (let prop of props) {
    let num = Math.floor(prop.ratio / sumOfRatio * numSamples);
    for (let j = 0; j < num; j++) {
      let p = randOnLine(prop.p0, prop.p1);
      
      let noiseX = randUniform(-randRadius, randRadius) * noise;
      let noiseY = randUniform(-randRadius, randRadius) * noise;

      points.push({x: p.x + noiseX, y: p.y + noiseY, label: Number(prop.label)});
    }
  }
  
  return points;
}



/**
 * Returns a sample from a uniform [a, b] distribution.
 * Uses the seedrandom library as the random generator.
 */
function randUniform(a: number, b: number) {
  return Math.random() * (b - a) + a;
}

/**
 * Returns a sample from two points.
 * Uses the seedrandom library as the random generator.
 */
function randOnLine(a: Point, b: Point): Point {
  const t = Math.random();
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t  
  };
}


/**
 * Samples from a normal distribution. Uses the seedrandom library as the
 * random generator.
 *
 * @param mean The mean. Default is 0.
 * @param variance The variance. Default is 1.
 */
function normalRandom(mean = 0, variance = 1): number {
  let v1: number, v2: number, s: number;
  do {
    v1 = 2 * Math.random() - 1;
    v2 = 2 * Math.random() - 1;
    s = v1 * v1 + v2 * v2;
  } while (s > 1);

  let result = Math.sqrt(-2 * Math.log(s) / s) * v1;
  return mean + Math.sqrt(variance) * result;
}

/** Returns the eucledian distance between two points in space. */
function dist(a: Point, b: Point): number {
  let dx = a.x - b.x;
  let dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}
