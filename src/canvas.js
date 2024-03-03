/* eslint-disable react-hooks/exhaustive-deps */
import React, { useRef, useEffect, useState } from "react";

import { ComputeEngine } from "@cortex-js/compute-engine";
import {all, create} from "mathjs";

import myMath from "./Math";
const Canvas = ({ data, settingsGrid, variable, handleVariable }) => {
  //canvas Ref
  const canvasRef = useRef(null);
  //Temp coordinate
  const [coordinate, setCoordinate] = useState([0, 0]);
  //Can you drag canvas
  const [changible, setChange] = useState(false);
  //Check value of mouse-point
  const [checkData, setCheckData] = useState([false, -1, []]);
  //Resolution(in math)
  const [res, setRes] = useState([-10, -10, 10, 10]);
  //Resolution(display)
  const [resolution, setResolution] = useState([800, 800]);
  //Main Range(Big)
  const [mainrange, setRange] = useState(settingsGrid.pi ? 2*myMath.pi : 2);
  //Quality: x1 = x0 + 1 /quality
  const [quality] = useState(100);
  //Coordinate of all points
  const fullData = [];
  //check New Variable
  const variableNew = [];
  const [settingpi, setSettingsPi]= useState(settingsGrid.pi)
  

  //mth&graph
  function mthtographX(x) {
    return ((x - res[0]) * resolution[0]) / (res[2] - res[0]);
  }
  function mthtographY(y) {
    return resolution[1] * (1 - (y - res[1]) / (res[3] - res[1]));
  }
  function graphXtoMth(x) {
    return ((res[2] - res[0]) * x) / resolution[0];
  }
  function graphYtoMth(y) {
    return (y * (res[3] - res[1])) / resolution[1];
  }

  //round function
  const rounded = function (number, to) {
    number = Number(number);
    return +number.toFixed(to);
  };
  const roundRange = function (number, pi = 1) {
    number = Number(number);
    let div = 1;
    if (number < 0) div = -1;
    let about;
    number *= pi;
    about = [
      0.001, 0.002, 0.005, 0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50,
      100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000,
      500000, 1000000,
    ];
    if (number < about[0]*pi) return about[0]*pi;
    for (let i = 0; i < about.length - 1; i++) {
      if (number < about[i + 1]*pi && number >= about[i]*pi) return div * about[i]*pi;
    }
    let i = 0;
    if(pi === 1){
      while (number > 10) {
        number /= 10;
        i++;
      }
      return div * Math.pow(10, i);
    }
    else{
      return number / pi;
    }
  };
  //MAIN
  useEffect(() => {
    //set canvas
    const canvas = canvasRef.current;
    //Canvas API
    const context = canvas.getContext("2d");

    //add variable
    function addVariable(name) {
      if (variableNew.indexOf(name) === -1) variableNew.push(name);
    }
    //round part 2
    function roundtomulti(a, multi) {
      var delta = a % multi;
      delta && (a = a - delta + (a > 0 ? 1 : 0) * multi);
      return rounded(a, 10);
    }
    //Search f(x) in data(CAN BE NOT THIS)
    function searchFx(name) {
      for (let i = 0; i < data.length; i++) {
        const currentItem = data[i];
        if (currentItem.data[0] === "Equal" && currentItem.data[1][0] === name) {//check if it's ["Equal", "f(or some different)", ...]
          return currentItem.data[2];
        }
      }
      return "error";
    }
    //function to build deretive line(from data of point)
    function derivative(points) {
      var new_points = [];
      //Foreach to all point
      for (var i = 2; i < points.length; i++) {
        if (
          isNaN(points[i][1]) ||
          isNaN(points[i - 1][1]) ||
          isNaN(points[i][0]) ||
          isNaN(points[i - 1][0])
        ) { //check if point exist
          new_points.push([points[i][0], NaN]);
        } else if (
          myMath.abs(points[i][1]) === Infinity ||
          myMath.abs(points[i - 1][1]) === Infinity
        ) { //check if point not infinity and before point
          new_points.push([points[i][0], NaN]);
        } else { //set new point like: (y2-y1)/(x2-x1)
          let a1 = rounded(points[i][1] - points[i - 1][1], 10);
          let a2 = rounded(points[i][0] - points[i - 1][0], 10);
          if (a2 === 0) new_points.push([points[i][0], NaN]);
          new_points.push([points[i][0], a1 / a2]);
        }
      }
      return new_points;
    }
    //HASH TABLE
    class HashTable {
      constructor() {
        this.table = new Array(127);
        this.size = 0;
      }
      _hash(key) {
        let hash = 0;
        for (let i = 0; i < key.length; i++) {
          hash += key.charCodeAt(i);
        }
        return hash;
      }
      set(key, value) {
        const index = this._hash(JSON.stringify(key));
        this.table[index] = [JSON.stringify(key), value];
        this.size++;
      }
      get(key) {
        const index = this._hash(JSON.stringify(key));
        let l = this.table[index];
        return l === undefined ? undefined : l[1];
      }
    }
    function toLatexCode(){
      const ce = new ComputeEngine();
      let s = searchFx("f");
      return ce.box(s).latex;
    }
    //create exampler of table
    const tableRelief = new HashTable();
    let tableDerivative = new HashTable();

    if (toLatexCode() === "\\sin(4x+x^2)" || toLatexCode() === "\\error{f(x)}=\\sin(4x+x^2)") {
      tableDerivative.set(
        ["DerivativeFunction", "x_0", 1],
        "(2 * x + 4) * cos(4 x + x ^ 2)"
      );
      tableDerivative.set(
        ["DerivativeFunction", "x_0", 2],
        "2 * cos(4 x + x ^ 2) + (-(2 * x) - 4) * (2 * x + 4) * sin(4 x + x ^ 2)"
      );
      tableDerivative.set(
        ["DerivativeFunction", "x_0", 3],
        "sin(4 x + x ^ 2) * (4 * (-(2 * x) - 4) - 2 * (2 * x + 4)) + (2 * x + 4) ^ 2 * (-(2 * x) - 4) * cos(4 x + x ^ 2)"
      );
      tableDerivative.set(
        ["DerivativeFunction", "x_0", 4],
        'cos(4 x + x ^ 2) * (8 * (2 * x + 4) * (-(2 * x) - 4) - 4 * (2 * x + 4) ^ 2) + sin(4 x + x ^ 2) * ((2 * x + 4) ^ 4 - 12)'
      );
      tableDerivative.set(
        ["DerivativeFunction", "x_0", 5],
        'cos(4 x + x ^ 2) * (16 * (-(2 * x) - 4) + (2 * x + 4) * ((2 * x + 4) ^ 4 - 12) - 16 * (4 * x + 8)) + sin(4 x + x ^ 2) * (8 * ((-(2 * x) - 4) ^ 2 * (2 * x + 4) + (2 * x + 4) ^ 3) - 4 * (-(2 * x) - 4) * (2 * x + 4) ^ 2)'
      );
      tableDerivative.set(
        ["DerivativeFunction", "x_0", 6],
        "cos(4 x + x ^ 2) * (8 * (2 * (2 * x + 4) ^ 4 + (2 * x + 4) ^ 2 * (-(2 * x) - 4) ^ 2) + 2 * ((2 * x + 4) ^ 4 - 12) - 4 * (2 * x + 4) ^ 3 * (-(2 * x) - 4) - 96) + sin(4 x + x ^ 2) * ((-(2 * x) - 4) * ((2 * x + 4) * ((2 * x + 4) ^ 4 - 28) - 16 * (4 * x + 8)) + 16 * (-(2 * x) - 4) ^ 2 + 8 * (7 * (2 * x + 4) ^ 2 + 2 * (-(2 * x) - 4) ^ 2 - 4 * (-(2 * x) - 4) * (2 * x + 4)))"
      );
      tableDerivative.set(
        ["DerivativeFunction", "x_0", 7],
        "cos(4 x + x ^ 2) * (8 * (17 * (2 * x + 4) ^ 3 + 4 * (2 * x + 4) * (-(2 * x) - 4) ^ 2 - 4 * (2 * x + 4) ^ 2 * (-(2 * x) - 4)) + 16 * (2 * x + 4) ^ 3 + (2 * x + 4) * ((-(2 * x) - 4) * ((2 * x + 4) * ((2 * x + 4) ^ 4 - 28) - 16 * (4 * x + 8)) + 16 * (-(2 * x) - 4) ^ 2 + 8 * (7 * (2 * x + 4) ^ 2 + 2 * (-(2 * x) - 4) ^ 2 - 4 * (-(2 * x) - 4) * (2 * x + 4))) - 24 * (2 * x + 4) ^ 2 * (-(2 * x) - 4)) + sin(4 x + x ^ 2) * ((-(2 * x) - 4) * (2 * (2 * (2 * x + 4) ^ 4 - 40) + 8 * (3 * (2 * x + 4) ^ 4 + (2 * x + 4) ^ 2 * (-(2 * x) - 4) ^ 2) - 224) + 8 * (36 * (2 * x + 4) - 8 * (-(4 * x) - 8)) - 4 * (-(2 * x) - 4) ^ 2 * (2 * x + 4) ^ 3 - 2 * ((2 * x + 4) * ((2 * x + 4) ^ 4 - 28) - 16 * (4 * x + 8)))"
      );
      tableDerivative.set(
        ["DerivativeFunction", "x_0", 8],
        "cos(4 x + x ^ 2) * ((2 * x + 4) * ((-(2 * x) - 4) * (8 * (4 * (2 * x + 4) ^ 4 + (2 * x + 4) ^ 2 * (-(2 * x) - 4) ^ 2) + 2 * (3 * (2 * x + 4) ^ 4 - 68) - 448) + 16 * (36 * (2 * x + 4) - 8 * (-(4 * x) - 8)) - 4 * ((2 * x + 4) * ((2 * x + 4) ^ 4 - 28) - 16 * (4 * x + 8))) + 144 * (2 * x + 4) ^ 2 + 8 * (110 * (2 * x + 4) ^ 2 + 8 * (-(2 * x) - 4) ^ 2 - 32 * (2 * x + 4) * (-(2 * x) - 4)) + 2 * ((-(2 * x) - 4) * ((2 * x + 4) * ((2 * x + 4) ^ 4 - 28) - 16 * (4 * x + 8)) + 16 * (-(2 * x) - 4) ^ 2 + 8 * (7 * (2 * x + 4) ^ 2 + 2 * (-(2 * x) - 4) ^ 2 - 4 * (-(2 * x) - 4) * (2 * x + 4))) - 4 * (2 * x + 4) ^ 4 * (-(2 * x) - 4) ^ 2) + sin(4 x + x ^ 2) * ((-(2 * x) - 4) * (64 * (2 * x + 4) ^ 3 + 8 * (41 * (2 * x + 4) ^ 3 + 8 * (2 * x + 4) * (-(2 * x) - 4) ^ 2 - 8 * (2 * x + 4) ^ 2 * (-(2 * x) - 4)) + (2 * x + 4) * ((-(2 * x) - 4) * ((2 * x + 4) * ((2 * x + 4) ^ 4 - 28) - 16 * (4 * x + 8)) + 16 * (-(2 * x) - 4) ^ 2 + 8 * (7 * (2 * x + 4) ^ 2 + 2 * (-(2 * x) - 4) ^ 2 - 4 * (-(2 * x) - 4) * (2 * x + 4)))) + 832 - 48 * (-(2 * x) - 4) ^ 2 * (2 * x + 4) ^ 2 - 2 * (8 * (4 * (2 * x + 4) ^ 4 + (2 * x + 4) ^ 2 * (-(2 * x) - 4) ^ 2) + 2 * (3 * (2 * x + 4) ^ 4 - 68) - 288))"
      );
      tableDerivative.set(
        ["DerivativeFunction", "x_0", 9],
        "cos(4 x + x ^ 2) * ((2 * x + 4) * ((-(2 * x) - 4) * (112 * (2 * x + 4) ^ 3 + 8 * (12 * (2 * x + 4) * (-(2 * x) - 4) ^ 2 + 73 * (2 * x + 4) ^ 3 - 12 * (2 * x + 4) ^ 2 * (-(2 * x) - 4)) + (2 * x + 4) * ((-(2 * x) - 4) * ((2 * x + 4) * ((2 * x + 4) ^ 4 - 28) - 16 * (4 * x + 8)) + 16 * (-(2 * x) - 4) ^ 2 + 8 * (7 * (2 * x + 4) ^ 2 + 2 * (-(2 * x) - 4) ^ 2 - 4 * (-(2 * x) - 4) * (2 * x + 4)))) + 3072 - 2 * (2 * (6 * (2 * x + 4) ^ 4 + 8 * (4 * (2 * x + 4) ^ 4 + (2 * x + 4) ^ 2 * (-(2 * x) - 4) ^ 2) - 136) - 736) - 4 * (2 * ((2 * x + 4) ^ 4 - 28) + 8 * (2 * x + 4) ^ 4 - 64)) + 2 * (24 * (36 * (2 * x + 4) - 8 * (-(4 * x) - 8)) + (-(2 * x) - 4) * (2 * (4 * (2 * x + 4) ^ 4 - 96) + 8 * (5 * (2 * x + 4) ^ 4 + (2 * x + 4) ^ 2 * (-(2 * x) - 4) ^ 2) - 576) - 6 * ((2 * x + 4) * ((2 * x + 4) ^ 4 - 28) - 16 * (4 * x + 8))) + 8 * (504 * (2 * x + 4) - 96 * (-(2 * x) - 4)) + 16 * (2 * x + 4) ^ 4 * (-(2 * x) - 4) - 80 * (2 * x + 4) ^ 3 * (-(2 * x) - 4) ^ 2) + sin(4 x + x ^ 2) * ((-(2 * x) - 4) * (8 * (24 * (-(2 * x) - 4) ^ 2 + 372 * (2 * x + 4) ^ 2 - 96 * (2 * x + 4) * (-(2 * x) - 4)) + 720 * (2 * x + 4) ^ 2 + (2 * x + 4) * (24 * (36 * (2 * x + 4) - 8 * (-(4 * x) - 8)) + (-(2 * x) - 4) * (2 * (4 * (2 * x + 4) ^ 4 - 96) + 8 * (5 * (2 * x + 4) ^ 4 + (2 * x + 4) ^ 2 * (-(2 * x) - 4) ^ 2) - 576) - 6 * ((2 * x + 4) * ((2 * x + 4) ^ 4 - 28) - 16 * (4 * x + 8))) + 4 * ((-(2 * x) - 4) * ((2 * x + 4) * ((2 * x + 4) ^ 4 - 28) - 16 * (4 * x + 8)) + 16 * (-(2 * x) - 4) ^ 2 + 8 * (7 * (2 * x + 4) ^ 2 + 2 * (-(2 * x) - 4) ^ 2 - 4 * (-(2 * x) - 4) * (2 * x + 4)))) + -(2 * (8 * (12 * (2 * x + 4) * (-(2 * x) - 4) ^ 2 + 73 * (2 * x + 4) ^ 3 - 12 * (2 * x + 4) ^ 2 * (-(2 * x) - 4)) + 112 * (2 * x + 4) ^ 3 + (2 * x + 4) * ((-(2 * x) - 4) * ((2 * x + 4) * ((2 * x + 4) ^ 4 - 28) - 16 * (4 * x + 8)) + 16 * (-(2 * x) - 4) ^ 2 + 8 * (7 * (2 * x + 4) ^ 2 + 2 * (-(2 * x) - 4) ^ 2 - 4 * (-(2 * x) - 4) * (2 * x + 4))))) - 192 * (-(2 * x) - 4) ^ 2 * (2 * x + 4) - 4 * (-(2 * x) - 4) ^ 3 * (2 * x + 4) ^ 4)"
      );
      tableDerivative.set(
        ["DerivativeFunction", "x_0", 10],
        "cos(4 x + x ^ 2) * ((2 * x + 4) * ((-(2 * x) - 4) * ((2 * x + 4) * (32 * (36 * (2 * x + 4) - 8 * (-(4 * x) - 8)) + (-(2 * x) - 4) * (8 * (6 * (2 * x + 4) ^ 4 + (2 * x + 4) ^ 2 * (-(2 * x) - 4) ^ 2) + 2 * (5 * (2 * x + 4) ^ 4 - 124) - 704) - 8 * ((2 * x + 4) * ((2 * x + 4) ^ 4 - 28) - 16 * (4 * x + 8))) + 6 * ((-(2 * x) - 4) * ((2 * x + 4) * ((2 * x + 4) ^ 4 - 28) - 16 * (4 * x + 8)) + 16 * (-(2 * x) - 4) ^ 2 + 8 * (7 * (2 * x + 4) ^ 2 + 2 * (-(2 * x) - 4) ^ 2 - 4 * (-(2 * x) - 4) * (2 * x + 4))) + 8 * (810 * (2 * x + 4) ^ 2 + 24 * (2 * (-(2 * x) - 4) ^ 2 + (2 * x + 4) ^ 2) - 192 * (2 * x + 4) * (-(2 * x) - 4)) + 1392 * (2 * x + 4) ^ 2) - 2 * (2 * (2 * x + 4) * ((-(2 * x) - 4) * ((2 * x + 4) * ((2 * x + 4) ^ 4 - 28) - 16 * (4 * x + 8)) + 16 * (-(2 * x) - 4) ^ 2 + 8 * (7 * (2 * x + 4) ^ 2 + 2 * (-(2 * x) - 4) ^ 2 - 4 * (-(2 * x) - 4) * (2 * x + 4))) + 8 * (2 * (73 * (2 * x + 4) ^ 3 - 12 * (2 * x + 4) ^ 2 * (-(2 * x) - 4)) + 24 * (2 * x + 4) * (-(2 * x) - 4) ^ 2) + 224 * (2 * x + 4) ^ 3) - 4 * (128 * (2 * x + 4) ^ 3 + 8 * (32 * (2 * x + 4) ^ 3 + 4 * (2 * x + 4) * (-(2 * x) - 4) ^ 2 - 4 * (2 * x + 4) ^ 2 * (-(2 * x) - 4)))) + 448 * (2 * x + 4) ^ 3 * (-(2 * x) - 4) + 2 * ((-(2 * x) - 4) * (8 * (113 * (2 * x + 4) ^ 3 + 16 * (2 * x + 4) * (-(2 * x) - 4) ^ 2 - 16 * (2 * x + 4) ^ 2 * (-(2 * x) - 4)) + 176 * (2 * x + 4) ^ 3 + (2 * x + 4) * ((-(2 * x) - 4) * ((2 * x + 4) * ((2 * x + 4) ^ 4 - 28) - 16 * (4 * x + 8)) + 16 * (-(2 * x) - 4) ^ 2 + 8 * (7 * (2 * x + 4) ^ 2 + 2 * (-(2 * x) - 4) ^ 2 - 4 * (-(2 * x) - 4) * (2 * x + 4)))) + 5568 - 10 * (2 * ((2 * x + 4) ^ 4 - 28) + 8 * (2 * x + 4) ^ 4 - 64) - 2 * (2 * (10 * (2 * x + 4) ^ 4 + 8 * (4 * (2 * x + 4) ^ 4 + (2 * x + 4) ^ 2 * (-(2 * x) - 4) ^ 2) - 232) + 8 * (5 * (2 * x + 4) ^ 4 + (2 * x + 4) ^ 2 * (-(2 * x) - 4) ^ 2) - 1312)) + 9600 + -(672 * (2 * x + 4) ^ 2 * (-(2 * x) - 4) ^ 2) - 4 * (2 * x + 4) ^ 5 * (-(2 * x) - 4) ^ 3 - 32 * (2 * x + 4) ^ 4) + sin(4 x + x ^ 2) * ((-(2 * x) - 4) * (8 * (2184 * (2 * x + 4) - 384 * (-(2 * x) - 4)) + 4 * ((-(2 * x) - 4) * (8 * (6 * (2 * x + 4) ^ 4 + (2 * x + 4) ^ 2 * (-(2 * x) - 4) ^ 2) + 2 * (5 * (2 * x + 4) ^ 4 - 124) - 704) + 32 * (36 * (2 * x + 4) - 8 * (-(4 * x) - 8)) - 8 * ((2 * x + 4) * ((2 * x + 4) ^ 4 - 28) - 16 * (4 * x + 8))) + (2 * x + 4) * ((-(2 * x) - 4) * (8 * (113 * (2 * x + 4) ^ 3 + 16 * (2 * x + 4) * (-(2 * x) - 4) ^ 2 - 16 * (2 * x + 4) ^ 2 * (-(2 * x) - 4)) + 176 * (2 * x + 4) ^ 3 + (2 * x + 4) * ((-(2 * x) - 4) * ((2 * x + 4) * ((2 * x + 4) ^ 4 - 28) - 16 * (4 * x + 8)) + 16 * (-(2 * x) - 4) ^ 2 + 8 * (7 * (2 * x + 4) ^ 2 + 2 * (-(2 * x) - 4) ^ 2 - 4 * (-(2 * x) - 4) * (2 * x + 4)))) + 9216 - 10 * (2 * ((2 * x + 4) ^ 4 - 28) + 8 * (2 * x + 4) ^ 4 - 64) - 2 * (2 * (10 * (2 * x + 4) ^ 4 + 8 * (4 * (2 * x + 4) ^ 4 + (2 * x + 4) ^ 2 * (-(2 * x) - 4) ^ 2) - 232) + 8 * (5 * (2 * x + 4) ^ 4 + (2 * x + 4) ^ 2 * (-(2 * x) - 4) ^ 2) - 1312))) + (-(2 * x) - 4) ^ 2 * (40 * (2 * x + 4) ^ 4 - 384) - 112 * (-(2 * x) - 4) ^ 3 * (2 * x + 4) ^ 3 - 2 * (6 * ((-(2 * x) - 4) * ((2 * x + 4) * ((2 * x + 4) ^ 4 - 28) - 16 * (4 * x + 8)) + 16 * (-(2 * x) - 4) ^ 2 + 8 * (7 * (2 * x + 4) ^ 2 + 2 * (-(2 * x) - 4) ^ 2 - 4 * (-(2 * x) - 4) * (2 * x + 4))) + (2 * x + 4) * ((-(2 * x) - 4) * (8 * (6 * (2 * x + 4) ^ 4 + (2 * x + 4) ^ 2 * (-(2 * x) - 4) ^ 2) + 2 * (5 * (2 * x + 4) ^ 4 - 124) - 704) + 32 * (36 * (2 * x + 4) - 8 * (-(4 * x) - 8)) - 8 * ((2 * x + 4) * ((2 * x + 4) ^ 4 - 28) - 16 * (4 * x + 8))) + 1392 * (2 * x + 4) ^ 2 + 8 * (810 * (2 * x + 4) ^ 2 + 24 * (2 * (-(2 * x) - 4) ^ 2 + (2 * x + 4) ^ 2) - 192 * (2 * x + 4) * (-(2 * x) - 4))))"
      );
    }
    else if (toLatexCode() === "\\lb(\\sin(x)^2)" || toLatexCode() === "\\log_{2}(\\sin(x)^2)"){
      tableDerivative.set(
        ["DerivativeFunction", "x_0", 1],
        "2.8853900817779268 * cos(x) / sin(x)"
      );
      tableDerivative.set(
        ["DerivativeFunction", "x_0", 2],
        "-(2.8853900817779268 * (cos(x) ^ 2 / sin(x) ^ 2 + 1))"
      );
      tableDerivative.set(
        ["DerivativeFunction", "x_0", 3],
        "5.7707801635558535 * (cos(x) + cos(x) ^ 3 / sin(x) ^ 2) / sin(x)"
      );
      tableDerivative.set(
        ["DerivativeFunction", "x_0", 4],
        "(567619800*cos(x)*sin(x)^4+1419049500*cos(x)^3*sin(x)^2+851429700*cos(x)^5)/(12295127*sin(x)^5)"
      );
      tableDerivative.set(
        ["DerivativeFunction", "x_0", 5],
        "(567619800*cos(x)*sin(x)^4+1419049500*cos(x)^3*sin(x)^2+851429700*cos(x)^5)/(12295127*sin(x)^5)"
      );
      tableDerivative.set(
        ["DerivativeFunction", "x_0", 6],
        "-(567619800*sin(x)^6+4824768300*cos(x)^2*sin(x)^4+8514297000*cos(x)^4*sin(x)^2+4257148500*cos(x)^6)/(12295127*sin(x)^6)"
      );
      tableDerivative.set(
        ["DerivativeFunction", "x_0", 7],
        "(9649536600*cos(x)*sin(x)^6+43706724600*cos(x)^3*sin(x)^4+59600079000*cos(x)^5*sin(x)^2+25542891000*cos(x)^7)/(12295127*sin(x)^7)"
      );
        tableDerivative.set(
          ["DerivativeFunction", "x_0", 8],
          "-(9649536600*sin(x)^8+140769710400*cos(x)^2*sin(x)^6+429120568800*cos(x)^4*sin(x)^4+476800632000*cos(x)^6*sin(x)^2+178800237000*cos(x)^8)/(12295127*sin(x)^8)"
        );
        tableDerivative.set(
          ["DerivativeFunction", "x_0", 9],
          "(281539420800*cos(x)*sin(x)^8+1998021696000*cos(x)^3*sin(x)^6+4577286067200*cos(x)^5*sin(x)^4+4291205688000*cos(x)^7*sin(x)^2+1430401896000*cos(x)^9)/(12295127*sin(x)^9)"
        );
        tableDerivative.set(
          ["DerivativeFunction", "x_0", 10],
          "-(281539420800*sin(x)^10+6275604508800*cos(x)^2*sin(x)^8+28880495424000*cos(x)^4*sin(x)^6+52924870152000*cos(x)^6*sin(x)^4+42912056880000*cos(x)^8*sin(x)^2+12873617064000*cos(x)^10)/(12295127*sin(x)^10)"
        );
    }
    else{
      tableDerivative = new HashTable();
    }
    //function to check if function isn't static(have "x")
    function hasVariable(arr) {
      if (!Array.isArray(arr)) {
        return arr === "x";
      }
      let stack = [...arr];
      while (stack.length > 0) {
        const current = stack.pop();
        if (Array.isArray(current)) {
          stack.push(...current);
        } else if (current === "x") {
          return true;
        }
      }
      return false;
    }
    //Calculate f(x)
    function f(x, data) {
      //Relief
      let srch = tableRelief.get(data);
      if (srch !== undefined) return srch;

      if (
        data === Infinity ||
        data === -Infinity ||
        typeof data === "number" ||
        (isNaN(data) && typeof data === "number") ||
        data === "error"
      )
        return data;

      if (typeof data === "undefined") return x;

      if (
        String(data).indexOf("Error") !== -1 ||
        String(data).indexOf("Nothing") !== -1
      )
        return "error";

      if (data === "x") return x;

      if (data === "Half") return 0.5;

      if (
        typeof data === "string" &&
        ((data.match(/^x_\d+$/) || data.match(/^[a-zA-Z]$/)) && data !== "s")
      ) {
        for (var v of variable) {
          if (v.name === data) {
            addVariable(v.name);
            return v.value;
          }
        }
        addVariable(data);
        return "error";
      }

      if (data[0] === "Delimiter" && data.length === 2) return f(x, data[1]);

      if (data[0] === "Add") {
        let y = 0;
        for (let i = 1; i < data.length; i++) {
          y = rounded(y + f(x, data[i]), 12);
        }
        return y;
      }

      if (data[0] === "Subtract") return f(x, data[1]) - f(x, data[2]);

      if (data[0] === "Multiply" || data[0] === "Pair") {
        //some funny staff to check arccot(x)
        if (
          data.length === 5 &&
          data[1] === "a" &&
          data[2] === "r" &&
          data[3] === "c" &&
          data[4][0] === "Cot"
        ) {
          return f(x, ["Arccot", data[4][1]]);
        }

        if (data[1] === "f") return f(x, ["f", data[2]]);
        let y = 1;
        for (let i = 1; i < data.length; i++) {
          y = rounded(y * f(x, data[i]), 12);
        }
        if (!hasVariable(data)) tableRelief.set(data, y);
        return y;
      }

      if (data[0] === "Negate") return -1 * f(x, data[1]);

      if (data[0] === "Rational" || data[0] === "Divide") {
        let l = rounded(myMath.divide(f(x, data[1]), f(x, data[2])), 10);
        if (!hasVariable(data)) tableRelief.set(data, l);
        return l;
      }

      if (data[0] === "Square")
        return rounded(myMath.power(f(x, data[1]), 2), 10);

      if (data[0] === "Power")
        return rounded(Math.pow(f(x, data[1]), f(x, data[2])), 10);

      if (data[0] === "Sqrt") return rounded(myMath.root(f(x, data[1]), 2), 10);
      if (data[0] === "Root") return rounded(myMath.root(f(x, data[1]), f(x, data[2])), 10);

      if (data[0] === "Log") {
        if (data[2]) return myMath.log(f(x, data[1]), f(x, data[2]));
        else return myMath.log(f(x, data[1]), 10);
      }

      if (data[0] === "Ln") return myMath.log(f(x, data[1]), -1);

      if (data[0] === "Lb") return myMath.log(f(x, data[1]), 2);

      if (data[0] === "Sin") return rounded(myMath.sin(f(x, data[1])), 14);

      if (data[0] === "Cos") return rounded(myMath.cos(f(x, data[1])), 14);

      if (data[0] === "Tan") return rounded(myMath.tan(f(x, data[1])), 14);

      if (data[0] === "Cot") return rounded(myMath.cot(f(x, data[1])), 14);

      if (data[0] === "Arcsin")
        return rounded(myMath.arcsin(f(x, data[1])), 14);
      if (data[0] === "Arccos")
        return rounded(myMath.arccos(f(x, data[1])), 14);
      if (data[0] === "Arctan")
        return rounded(myMath.arctan(f(x, data[1])), 14);
      if (data[0] === "Arccot")
        return rounded(myMath.arccot(f(x, data[1])), 14);

      if (data[0] === "Equal") return f(x, data[2]);

      if (data[0] === "Factorial") {
        let l = myMath.factorial(f(x, data[1]));
        if (!hasVariable(data)) tableRelief.set(data, l);
        return l;
      }
      //find 1-th derivative
      if (data[0] === "Derivative" || data[0] === "Prime") {
        if (data.length === 2) return f(x, ["Derivative", data[1], 1]);
        if (data[2] === 0) return f(x, data[1]);
        if (data[1][0] && data[1][0] === "f")
          return f(x, ["DerivativeFunction", data[1][1], data[2]]);
        let l = rounded(
          (f(x + 0.00001, ["Derivative", data[1], data[2] - 1]) -
            f(x, ["Derivative", data[1], data[2] - 1])) /
            0.00001,
          10
        );
        if (!hasVariable(data)) tableRelief.set(data, l);
        return l;
      }
      //difficult function to find n-th of derevative function(CUSTOM, YOU CAN'T USE IN MATH INPUT)
      if (data[0] === "DerivativeFunction") {
        //const mainStart = new Date().getTime();
        if (data[2] === 0) return f(x, ["f", data[1]]);
        if (data[2] === 1) {
          let l1 = f(x, ["f", ["Add", data[1], 0.00001]]);
          let l2 = f(x, ["f", data[1]]);
          let l = rounded(
            (l1 * 1000000000000 - l2 * 1000000000000) / 10000000,
            16
          );
          return l;
        }
        
        try {
          const ce = new ComputeEngine();
          let s = searchFx("f");
          if (isNaN(f(x, ["f", data[1]]))) return;
          let valx = f(x, data[1]);

          const math = create(all);
          let srch = tableDerivative.get(data);
          if (srch !== undefined)
          {
            let r = math.parse(srch.toString()).evaluate({ x: valx });
          if (!hasVariable(data)) tableRelief.set(data, r);
          return r;
          }

          let d = ce
            .box(s)
            .latex.replace(/[\\]/g, "")
          if (d === "log_{2}(sin(x)^2)") d = "log(sin(x)^2, 2)";
          else
            d = d
              .replace(
                /mathrm{Pair}\(\\frac{([^}]+)}{([^}]+)},\s*([^)]+)\)/,
                "$1/$2 * $3"
              )
              .replace(
                /mathrm{Pair}\(\\frac{([^}]+)}{([^}]+)},\s*([^)]+)\)/,
                "$1/$2 * $3"
              )
              .replace(/frac{([^{}]+)}{([^{}]+)}/, "$1/$2")
              .replace(/log\(([^)]+)\)/, "log($1, 10)")
              .replace(/log_{(\d+)}\(([^)]+)\)/, "log($2, $1)")
              .replace(/[{}]/g, "")
              .replace(/log_(\d+)\(([^)]+)\)/, "log($2, $1)")
              .replace(/ln\(([^}]*)\)/, "log($1)")
              .replace(/lb\(([^}]*)\)/, "log($1, 2)")
              .replace(/sqrt([^)]+)/, "sqrt($1)")
              .replace(/arcsin\(([^)]+)\)/, "asin($1)")
              .replace(/arccos\(([^)]+)\)/, "acos($1)")
              .replace(/arctan\(([^)]+)\)/, "atan($1)")
              .replace(/acrcot\(([^)]+)\)/, "atan(1/$1)")
              .replace(/arccot\(([^)]+)\)/, "atan(1/$1)");
          let res = math.parse(d);
          let res_;
          for (let i = 1; i <= data[2]; i++) {
            while (tableDerivative.get(["DerivativeFunction", "x_0", i]) !== undefined){
              res = tableDerivative.get(["DerivativeFunction", "x_0", i]);
              i++;
            }
            
              res = math.derivative(math.parse(res.toString()), "x", {simplify: true});
          }
          res_ = res.evaluate({ x: valx });
          if (!hasVariable(data)) tableRelief.set(data, res_);
          return res_;
        } catch(e) {
          console.log("out!", e);
          return NaN;
        }
      }
      if (data[0] === "f") {
        let s = searchFx("f");

        if (s === "error") return "error";

        let v = f(x, data[1]);

        let k = f(v, s);
        return k;
      }
      if (data[0] === "g") {
        let s = searchFx("g");

        if (s === "error") return "error";

        let v = f(x, data[1]);

        let k = f(v, s);
        return k;
      }
      //Repeat function(CUSTOM, YOU CAN'T USE IN MATH INPUT)
      if (data[0] === "RepeatFunction") {
        let d = 0;
        for (let k = f(x, data[2]); k <= f(x, data[3]); k++) {
          let v = JSON.parse(JSON.stringify(data[1]).replace(/"k"/g, k));
          let g = f(x, v);
          d += g;
        }
        return d;
      }

      return "error";
    }
    //Translate from number to pi
    function piToTxt(number){
      
      if(number === 0) return "0";
      let div = number > 0 ? false : true;
      let multy = rounded(myMath.abs(number / myMath.pi),4);
      if((div ? -1 : 1)*(multy*myMath.pi).toFixed(4) - number.toFixed(4) !== 0){
        return "" + number;
      }
      if(multy === 1) return (div ? "-" : "")+"π";
      if(multy % 1 === 0 || multy >= 1) return (div ? "-" : "")+multy+"π";
      if(multy < 1) return (div ? "-" : "")+"π/"+rounded(1/multy, 4);
    }

    //dash start
    function dash(ctx, res) {
      let height = ctx.canvas.height;
      let darkTheme = settingsGrid.darkTheme;
      const range = 10;

      //draw main dash
      ctx.beginPath();
      ctx.strokeStyle = darkTheme ? "white" : "black";
      if (res[0] <= 0 && res[2] >= 0) {
        ctx.moveTo(mthtographX(0), mthtographY(res[1]));
        ctx.lineTo(mthtographX(0), mthtographY(res[3]));
      }
      if (res[1] <= 0 && res[3] >= 0) {
        ctx.moveTo(mthtographX(res[0]), mthtographY(0));
        ctx.lineTo(mthtographX(res[2]), mthtographY(0));
      }
      ctx.stroke();

      //draw arrows
      ctx.beginPath();
      ctx.fillStyle = darkTheme ? "white" : "black";
      ctx.moveTo(mthtographX(0), mthtographY(res[3]));
      ctx.lineTo(mthtographX(0) - 5, mthtographY(res[3]) + 12);
      ctx.lineTo(mthtographX(0) + 5, mthtographY(res[3]) + 12);
      ctx.fill();
      ctx.beginPath();
      ctx.fillStyle = darkTheme ? "white" : "black";
      ctx.moveTo(mthtographX(res[2]), mthtographY(0));
      ctx.lineTo(mthtographX(res[2]) - 12, mthtographY(0) - 5);
      ctx.lineTo(mthtographX(res[2]) - 12, mthtographY(0) + 5);
      ctx.fill();

      //write XY
      ctx.font = "italic 400 13px sans-serif";
      ctx.textAlign = "center";
      ctx.beginPath();
      ctx.strokeStyle = darkTheme ? "white" : "black";
      ctx.fillText("x", mthtographX(res[2]) - 7.5, mthtographY(0) - 10);
      ctx.fillText("y", mthtographX(0) + 10, mthtographY(res[3]) + 9);
      ctx.fill();

      //draw main&grid
      ctx.beginPath();
      let smallRange = settingpi
        ? mainrange / 4
        : rounded(mainrange === 2 ? mainrange / 4 : mainrange / 5, 10);
      let x = roundtomulti(res[0], smallRange);
      while (x <= roundtomulti(res[2], smallRange)) {
        if (myMath.abs((x * 1000) % (mainrange * 1000)) / 1000 < 0.0001) {
          ctx.lineWidth = 0.2;
          ctx.strokeStyle = darkTheme ? "rgb(150,150,150)" : "rgb(20,20,20)";
        } else {
          ctx.lineWidth = 0.1;
          ctx.strokeStyle = darkTheme ? "rgb(100,100,100)" : "rgb(150,150,150)";
        }
        ctx.moveTo(mthtographX(x), mthtographY(res[3]));
        ctx.lineTo(mthtographX(x), mthtographY(res[1]));

        ctx.stroke();
        ctx.beginPath();
        x = rounded(x + smallRange, 4);
      }
      let y = roundtomulti(res[1], smallRange);
      while (y <= roundtomulti(res[3], smallRange)) {
        if (myMath.abs((y * 1000) % (mainrange * 1000)) / 1000 < 0.0001) {
          ctx.lineWidth = 0.2;
          ctx.strokeStyle = darkTheme ? "rgb(150,150,150)" : "rgb(20,20,20)";
        } else {
          ctx.lineWidth = 0.1;
          ctx.strokeStyle = darkTheme ? "rgb(100,100,100)" : "rgb(150,150,150)";
        }
        ctx.moveTo(mthtographX(res[0]), mthtographY(y));
        ctx.lineTo(mthtographX(res[2]), mthtographY(y));
        ctx.stroke();
        ctx.beginPath();
        y = rounded(y + smallRange, 4);
      }
      //draw text&dash
      ctx.font = "15px sans-serif";
      ctx.textAlign = "center";

      x = roundtomulti(res[0], mainrange);
      const zeroPoint = [
        mthtographX(Math.max(Math.min(res[2], 0), res[0])),
        mthtographY(Math.max(Math.min(res[3], 0), res[1])),
      ];
      while (x <= roundtomulti(res[2], mainrange)) {
        if (myMath.abs(x) < 0.0002) x = rounded(x + mainrange, 4);
        let text = settingpi ? piToTxt(x) : x.toString();
        ctx.lineWidth = 2;
        ctx.strokeStyle = darkTheme ? "rgb(230, 230, 230)" : "rgb(20,20,20)";
        ctx.moveTo(mthtographX(x), mthtographY(0) - range / 2);
        ctx.lineTo(mthtographX(x), mthtographY(0) + range / 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.strokeStyle = darkTheme ? "rgb(40,40,40)" : "white";
        ctx.strokeText(
          text,
          mthtographX(x),
          zeroPoint[1] + (height - zeroPoint[1] > 2 * range ? 2 : -1) * range
        );
        ctx.stroke();
        ctx.beginPath();
        ctx.fillStyle = darkTheme ? "white" : "black";
        ctx.fillText(
          text,
          mthtographX(x),
          zeroPoint[1] + (height - zeroPoint[1] > 2 * range ? 2 : -1) * range
        );
        x = rounded(x + mainrange, 4);
      }

      ctx.stroke();

      ctx.beginPath();
      ctx.font = "15px sans-serif";

      ctx.textAlign = zeroPoint[0] - 15 < range ? "left" : "right";
      y = roundtomulti(res[1], mainrange);
      while (y <= roundtomulti(res[3], mainrange)) {
        if (myMath.abs(y) < 0.0002) y = rounded(y + mainrange, 4);
        let text = settingpi ? piToTxt(y) : y.toString();
        ctx.lineWidth = 2;
        ctx.strokeStyle = darkTheme ? "rgb(230, 230, 230)" : "rgb(20,20,20)";
        ctx.moveTo(mthtographX(0) - range / 2, mthtographY(y));
        ctx.lineTo(mthtographX(0) + range / 2, mthtographY(y));
        ctx.stroke();
        ctx.beginPath();
        ctx.strokeStyle = darkTheme ? "rgb(40,40,40)" : "white";
        ctx.strokeText(
          text,
          zeroPoint[0] + (zeroPoint[0] - 15 < range ? 1 : -1) * range,
          mthtographY(y) + range / 2
        );
        ctx.stroke();
        ctx.beginPath();
        ctx.fillStyle = darkTheme ? "white" : "black";
        ctx.fillText(
          text,
          zeroPoint[0] + (zeroPoint[0] - 15 < range ? 1 : -1) * range,
          mthtographY(y) + range / 2
        );
        y = rounded(y + mainrange, 4);
      }
      if (res[0] <= 0 && res[1] <= 0 && res[2] >= 0 && res[3] >= 0) {
        ctx.strokeStyle = darkTheme ? "rgb(40,40,40)" : "white";
        ctx.strokeText(
          "0",
          mthtographX(0) - 2 * range,
          mthtographY(0) + 2 * range
        );
        ctx.stroke();
        ctx.beginPath();
        ctx.strokeStyle = darkTheme ? "white" : "black";
        ctx.fillText(
          "0",
          mthtographX(0) - 2 * range,
          mthtographY(0) + 2 * range
        );
      }
      ctx.stroke();
    }

    //DRAW MODULE
    const draw = (ctx, res) => {
      //Get new resolution
      ctx.canvas.width = resolution[0];
      ctx.canvas.height = resolution[1];

      //Clear old graphics
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      //get a start x
      let x = Math.floor(res[0]);

      //draw a dash
      dash(ctx, res);

      //Go to all data
      for (
        let itterator = 0;
        itterator < data.length;
        itterator++
      ) {
        let itData = data.at(itterator);
        if (
          itData.visible &&
          itData.data !== "error" &&
          itData.data !== "" &&
          itData.data !== undefined
        ) {
          x = Math.floor(res[0]);

          let dots = [];
          while (x <= Math.ceil(res[2])) {
            let y = f(x, itData.data);
            if (y > 1000) y = Infinity;
            if (y < -1000) y = -Infinity;
            dots.push([x, y]);
            x = rounded(x + 1 / quality, 8);
          }
          fullData.push(dots);
          ctx.beginPath();
          ctx.moveTo(mthtographX(dots[0][0]), mthtographY(dots[0][1]));
          for (let i = 1; i < dots.length; i++) {
            if (
              isNaN(dots[i][1]) && i + 1 < dots.length
            ) {
              i++;
              
              let y = mthtographY(dots[i][1]);
              if (y === -Infinity) y = mthtographY(res[3]) - 20;
              if (y === Infinity) y = mthtographY(res[1]) + 20;
              ctx.moveTo(mthtographX(dots[i][0]), y);
              continue;
            }
            let y = mthtographY(dots[i][1]);
            if (y === -Infinity) {
              y = mthtographY(res[3]) - 20;
            }
            if (y === Infinity) y = mthtographY(res[1]) + 20;
            ctx.lineTo(mthtographX(dots[i][0]), y);
          }
          ctx.lineWidth = 5;
          ctx.strokeStyle = "#" + itData.color;
          ctx.stroke();

          //Angle
          if (itData.angle) {
            const index0X = dots.findIndex(([x, y]) => myMath.abs(y) <= 0.1);
            if (index0X !== -1 && dots[index0X - 1] && dots[index0X + 1]) {
              let y0Y = f(0, itData.data),
                k =
                  (dots[index0X - 1][1] - dots[index0X + 1][1]) /
                  (dots[index0X - 1][0] - dots[index0X + 1][0]),
                x0X = (-1 * y0Y) / k,
                angle = myMath.arctan(-1 * k);
              angle = angle > 0 ? -1 * (myMath.pi - angle) : angle;

              ctx.beginPath();
              ctx.font = "600 20px sans-serif";
              ctx.textAlign = "left";
              ctx.fillStyle = "#" + itData.color;
              ctx.arc(mthtographX(x0X), mthtographY(0), 70, 0, angle, true);
              ctx.fillText(
                rounded(myMath.toDegree(-angle), 0) + "°",
                mthtographX(x0X) + 80 * myMath.cos((-1 * angle) / 2),
                mthtographY(0) - 80 * myMath.sin((-1 * angle) / 2)
              );
              ctx.lineWidth = 5;
              ctx.strokeStyle = "#" + itData.color;
              ctx.stroke();
              ctx.beginPath();
              ctx.lineWidth = 0.4;
              ctx.strokeStyle = "#fff";
              ctx.strokeText(
                rounded(myMath.toDegree(-angle), 0) + "°",
                mthtographX(x0X) + 80 * myMath.cos((-1 * angle) / 2),
                mthtographY(0) - 80 * myMath.sin((-1 * angle) / 2)
              );
              ctx.stroke();
            }
          }
          //triangle
          if (itData.triangle && itData.triangle[0] && itData.triangle[1]) {
            const x0 = f(0, itData.triangle[0]);
            const a = itData.triangle[1];
            var y1 = f(x0 - a / 2, itData.data);
            var y2 = f(x0 + a / 2, itData.data);

            ctx.beginPath();
            ctx.font = "600 25px sans-serif";
            ctx.textAlign = "center";
            ctx.lineWidth = 5;
            ctx.strokeStyle = "#" + itData.color;
            ctx.fillStyle = "#" + itData.color;
            //oX
            ctx.lineTo(mthtographX(x0 - a/2) + (y1<y2 ? 0 : -2.5), mthtographY(myMath.min(y1, y2)));
            ctx.lineTo(mthtographX(x0 + a/2) + (y1>y2 ? 0 : 2.5), mthtographY(myMath.min(y1, y2)));
            
            ctx.stroke();
            //oY
            ctx.beginPath();
            if(y1 > y2){
              ctx.lineTo(mthtographX(x0 - a / 2), mthtographY(y2));
              ctx.lineTo(mthtographX(x0 - a/2), mthtographY(y1));
              ctx.fillText(
                myMath.abs(rounded(y2 - y1, 3)),
                mthtographX(x0 - 0.5) - 30,
                mthtographY((y2 + y1) / 2) + 20
              );
            }else{
              ctx.lineTo(mthtographX(x0 + a/2), mthtographY(y2));
              ctx.lineTo(mthtographX(x0 + a/2), mthtographY(y1));
              ctx.fillText(
                myMath.abs(rounded(y2 - y1, 3)),
                mthtographX(x0 + a/2) + 30,
                mthtographY((y2 + y1) / 2) + 35
              );
            }
            ctx.stroke();
          }
          //OY LINE
          if(itData.oy){
            const x0 = f(0, itData.oy);
            var y = f(x0, itData.data);

            ctx.beginPath();
            ctx.font = "600 25px sans-serif";
            ctx.textAlign = "center";
            ctx.lineWidth = 5;
            ctx.strokeStyle = "#" + itData.color;
            ctx.fillStyle = "#" + itData.color;
            ctx.lineTo(mthtographX(x0), mthtographY(0));
            ctx.lineTo(mthtographX(x0), mthtographY(y));
            ctx.fillText(
              rounded(y, 3),
              mthtographX(x0) + (x0 > 0 ? 30 : -30),
              mthtographY(y / 2) + 35
            );
            ctx.stroke();
          }
          //Points
          if(itData.points){
            itData.points.forEach(element => {
              try{
                ctx.beginPath();
                ctx.fillStyle = "#" + itData.color;
                ctx.strokeStyle = !settingsGrid.darkTheme ? "rgb(40,40,40)" : "white";
                ctx.lineWidth = 2;
                let x0, y;
                if(element[0]){
                  x0 = f(0, element[0]);
                  y = f(x0, itData.data);
                  ctx.arc(mthtographX(x0), mthtographY(y), 7, 0, 2 * Math.PI);
                }
                if(element[1] && element[1] !== ""){
                  ctx.font = "400 15px sans-serif";
                  ctx.textAlign = "center";
                  ctx.lineWidth = 2;
                  ctx.fillText(
                    element[1]
                      .replace("x", myMath.round(x0, 2))
                      .replace("y", myMath.round(y, 2)),
                    mthtographX(x0) ,
                    mthtographY(y) - 35
                  );
                  ctx.strokeText(
                    element[1]
                      .replace("x", myMath.round(x0, 2))
                      .replace("y", myMath.round(y, 2)),
                    mthtographX(x0),
                    mthtographY(y) - 35
                  );
                }
                ctx.fill();
                ctx.stroke();
              }
              catch(error){
                console.log("Error: points. Point: "+element[0]+". Line: "+itData.id+"\n "+error);
              }
            });
          }
          //DERECTIVE
          if (itData.directive) {
            var new_points = derivative(dots);
            fullData.push(new_points);
            ctx.beginPath();
            for (let i = 1; i < new_points.length; i++) {
              while (
                (isNaN(new_points[i][1]) || new_points[i][1] >= res[3]) &&
                i + 1 < new_points.length
              ) {
                i++;
                ctx.moveTo(
                  mthtographX(new_points[i][0]),
                  mthtographY(new_points[i][1])
                );
              }
              if (i < new_points.length) {
                let y = new_points[i][1];
                if (y === -Infinity) y = res[1];
                if (y === Infinity) y = res[3];
                ctx.lineTo(mthtographX(new_points[i][0]), mthtographY(y));
              }
            }
            ctx.lineWidth = 5;
            ctx.strokeStyle = "#" + itData.directiveColor;
            ctx.stroke();
          }
        }
      }
    };
    //RENDER ELEMENT
    const render = () => {
      draw(context, res);
      handleVariable(variableNew);
    };
    //RESIZE WINDOW
    const resizeHandler = () => {
      //get a canvas
      let canvas = canvasRef.current;
      //get a old resolution(temp)
      if (!canvas.offsetWidth || !canvas.offsetHeight) return;
      const tempResolution = [canvas.offsetWidth, canvas.offsetHeight];
      //check if new and old not equal
      if (JSON.stringify(tempResolution) === JSON.stringify(resolution))
        return 0;
      //get delta changes in Res(field of view limitation)
      const deltaWidth = graphXtoMth(
          (tempResolution[0] - resolution[0]) / 2,
          res,
          resolution[0]
        ),
        deltaHeight = graphYtoMth(
          (tempResolution[1] - resolution[1]) / 2,
          res,
          resolution[1]
        );
      //set new Resolution(window size)
      setResolution(tempResolution);
      //set new Res(field of view limitation)
      setRes([
        rounded(res[0] - deltaWidth, 5),
        rounded(res[1] - deltaHeight, 5),
        rounded(res[2] + deltaWidth, 5),
        rounded(res[3] + deltaHeight, 5),
      ]);
    };
    //call resize
    resizeHandler();
    window.addEventListener("resize", resizeHandler);
    //call render
    render();

    return () => {
      //remove event if ended
      window.removeEventListener("resize", resizeHandler);
    };
  }, [
    data,
    fullData,
    graphXtoMth,
    graphYtoMth,
    mainrange,
    mthtographX,
    mthtographY,
    quality,
    res,
    resolution,
    settingsGrid.darkTheme,
  ]);

  const checkCoordinate = (mouseX, mouseY) => {
    let coordinateX = rounded(graphXtoMth(mouseX) + res[0], 2);
    if(!fullData[0]) return [[], -1];
    let i = fullData[0].findIndex((nowData) => nowData[0] === coordinateX);
    if(i === -1) return [[], -1];
    let index = -1;
    let ret = fullData.find(
      (x, indexItterator) =>
        x[i][1] !== "error" &&
        myMath.abs(mthtographY(x[i][1]) - mouseY) <= 15 &&
        (index = indexItterator) !== -1
    );
    return (ret === undefined || isNaN(ret[i][1])) ? [[], -1] : [ret[i], index];
  };

  const findValue = (mouseX, index) => {
      try{
        return fullData[index][
          fullData[0].findIndex(
            (nowData) => nowData[0] === rounded(graphXtoMth(mouseX) + res[0], 2)
          )
        ];
    }
    catch{
      return 0;
    }
    }
  //MOUSE EVENT
  //Mouse DOWN
  const onMouseDownEvent = (event) => {
    //on changeability
    setChange(true);
    //set first coordinate of mouse
    setCoordinate([event.clientX, event.clientY]);
  };

  //Mouse UP
  const onMouseUpEvent = () => {
    //off changeability
    setChange(false);
    setCheckData([false, -1, []]);
  };

  //Mouse OUT
  const onMouseOutEvent = () => {
    //off changeability
    setChange(false);
  };

  //Mouse MOVE
  const onMouseMoveEvent = (event) => {
    //check changeability
    if (!changible && !checkData[0]) return;
    if (checkData[0]) {
      let val = findValue(event.clientX, checkData[1]);
      if(val !== 0 && isNaN(val[1])) return;
      setCheckData([true, checkData[1], val]);
      return;
    }
    let [itter, index] = checkCoordinate(event.clientX, event.clientY);
    if (itter.length === 2) {
      setCheckData([true, index, itter]);
      return;
    }
    //create newCoordinate and delta of move
    let newCoordinate = [event.clientX, event.clientY],
      dest = [
        graphXtoMth(newCoordinate[0] - coordinate[0], res, resolution[0]),
        graphYtoMth(newCoordinate[1] - coordinate[1], res, resolution[1]),
      ];
    //set new Res(field of view limitation)
    setRes([
      rounded(res[0] - dest[0], 10),
      rounded(res[1] + dest[1], 10),
      rounded(res[2] - dest[0], 10),
      rounded(res[3] + dest[1], 10),
    ]);
    //set next coordinate of mouse
    setCoordinate([event.clientX, event.clientY]);
  };
  //Mouse Wheel MOVE
  const onWheelEvent = (event) => {
    //set delta of width and height Res(field of view limitation)
    let deltaWidth = graphXtoMth(event.deltaY),
      deltaHeight =
        (res[3] - res[1]) *
        (1 - (res[2] - res[0] - deltaWidth) / (res[2] - res[0]));
    //check changeability of fixed limitation
    if (
      (deltaWidth > 0 || deltaHeight > 0) &&
      (rounded(res[3] - res[1] + 2 * deltaWidth, 10) <= 0.0025 ||
        rounded(res[2] - res[0] + 2 * deltaHeight, 10) <= 0.0025)
    )
      return 0;
    //set new Res(field of view limitation)
    setRes([
      rounded(res[0] + deltaWidth, 5),
      rounded(res[1] + deltaHeight, 5),
      rounded(res[2] - deltaWidth, 5),
      rounded(res[3] - deltaHeight, 5),
    ]);
    //set new range(stripes)
    setRange(roundRange(graphXtoMth(100), (settingpi ? myMath.pi : 1)));
  };
  if(settingpi !== settingsGrid.pi) {
    setSettingsPi(settingsGrid.pi);
    setRange(settingsGrid.pi ? 2 * myMath.pi : 2);
  }
  return (
    <>
      <div
        className={"overValue" + (checkData[0] ? " display" : "")}
        style={
          checkData[0]
            ? {
                top: mthtographY(checkData[2][1]) - 50 + "px",
                left: mthtographX(checkData[2][0]) - 50 + "px",
              }
            : {}
        }
      >
        {checkData[0]
          ? "(" + checkData[2][0] + "; " + rounded(checkData[2][1], 2) + ")"
          : ""}
      </div>
      <canvas
        ref={canvasRef}
        onMouseDown={onMouseDownEvent}
        onMouseUp={onMouseUpEvent}
        onMouseMove={onMouseMoveEvent}
        onMouseOut={onMouseOutEvent}
        onWheel={onWheelEvent}
      />
    </>
  );
};

export default Canvas;
