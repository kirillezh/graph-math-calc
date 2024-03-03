//const rounded = function (number, to) {return number.toFixed(to)}
//const magicRound = function(number, to){return Math.round(number*Math.pow(10, to)/Math.pow(10, to))}

class myMath {
  static pi = 3.14159265358979;

  static round = function (number, to) {
    number = Number(number);
    return +number.toFixed(to);
  };
  static abs(number) {
    //return absolute value
    return number > 0 ? number : -number;
  }
  static sign(number) {
    //return sign of number
    return number > 0 ? 1 : -1;
  }
  static factorial(base) {
    // Math: base * (base-1) * (base-2) * ... ... * 1
    if (base === 0 || base === 1) return 1;
    let number = base;
    while (--base > 0) number *= base;
    return number;
  }
  //deg = (rad * 180)/pi
  static toDegree = (radian) => (radian * 180) / this.pi;

  //pow to int
  static pow__ = (base, exponent) =>
    base === 0
      ? 0
      : Array.from({ length: exponent }, () => base).reduce(
          (acc, val) => acc * val,
          1
        );
  //min a, b
  static min(a, b) {
    return a > b ? b : a;
  }
  //max a, b
  static max(a, b) {
    return a < b ? b : a;
  }
  //divide with check
  static divide(dividend, divisor) {
    if (divisor === 0) return NaN;
    return dividend / divisor;
  }
  //main power
  static power(base, exponent) {
    if (base === "error" || exponent === "error") return "error";
    if (isNaN(base) || isNaN(exponent)) return NaN;
    if (exponent === 0) return 1;
    if (exponent < 0)
      if (Number.isInteger(exponent))
        return this.divide(1, this.pow__(base, this.abs(exponent)));
      else if (base > 0)
        return this.divide(1, this.root(base, 1 / this.abs(exponent)));
      else if ((exponent * 10) % 4 === 0)
        return -1 * this.divide(1, this.root(base, 1 / this.abs(exponent)));
      else if ((exponent * 10) % 2 === 0)
        return this.divide(1, this.root(base, 1 / this.abs(exponent)));
      else return NaN;
    if (Number.isInteger(exponent)) return this.pow__(base, exponent);
    else if ((exponent * 10) % 4 === 0)
      return this.root(myMath.abs(base), 1 / exponent);
    else if ((exponent * 10) % 2 === 0) return this.root(base, 1 / exponent);
    else if (base < 0) return NaN;
    else return this.root(base, 1 / exponent);
  }
  //exp in power
  static exp(power) {
    // Math: e^power = 1 + power / 1! + power^2 / 2! + ...
    let number = 1,
      iterator = 1,
      row;
    while (
      myMath.abs((row = power ** iterator / myMath.factorial(iterator))) >=
      0.000000000000000001
    ) {
      number += row;
      iterator++;
    }
    return number;
  }

  static log(number, base) {
    //Math: ln number / ln base
    if (number === "error" || base === "error") return "error";
    if (base === -1) return Math.log(number);
    if (base === 1 || base <= 0) return "error";
    if (number < 0) return NaN;
    return Math.log(number) / Math.log(base);
  }

  static root(number, exponent) {
    if (number === "error" || exponent === "error") return "error";
    // Math: e ^ (ln(number) / exponent)
    if (number === 0) return 0;
    if (exponent % 2 === 0 && number < 0) return NaN;
    let root =
      myMath.sign(number) * myMath.exp(Math.log(myMath.abs(number)) / exponent);
    return root;
  }
  //optimize degree(all degree to [-pi/2, pi/2])
  static opt_degree(number) {
    number = number % (myMath.pi * 2);
    if (number >= myMath.pi && number < myMath.pi * 2) number -= 2 * myMath.pi;
    if (myMath.abs(number) >= myMath.pi / 2 && myMath.abs(number) <= myMath.pi)
      number = myMath.sign(number) * (myMath.pi - myMath.abs(number));
    return number;
  }
  //fucntion sin(Taylor)
  static sin(number) {
    if (number === "error") return "error";
    number = myMath.opt_degree(number);

    if (number === 0) return 0;

    let iterator = 1,
      sin = number,
      row;
    while (
      myMath.abs(
        (row =
          ((iterator % 2 === 1 ? -1 : 1) * number ** (2 * iterator + 1)) /
          myMath.factorial(2 * iterator + 1))
      ) >= 0.0000000001
    ) {
      sin += row;
      iterator++;
    }
    return sin;
  }
  //cos: from sin
  static cos(number) {
    if (number === "error") return "error";
    return myMath.sin(myMath.pi / 2 - number);
  }
  //tg: from sin
  static tan(number) {
    if (number === "error") return "error";
    if (myMath.abs((myMath.abs(number) % myMath.pi) - myMath.pi / 2) < 0.0055)
      return NaN;
    return myMath.sin(number) / myMath.cos(number);
  }
  //ctg: from sin
  static cot(number) {
    if (number === "error") return "error";
    if (number === 0) return NaN;
    if (myMath.abs((myMath.abs(number) % myMath.pi) - myMath.pi) < 0.01)
      return NaN;
    return myMath.cos(number) / myMath.sin(number);
  }

  //by calulate of Taylor series
  static arcsin(number) {
    if (number > 1 || number < -1) return NaN;
    if(number === 1) return this.pi/2;
    if (number === -1) return -this.pi / 2;
    return (
      0.9678828 * number +
      0.8698691 * this.pow__(number, 3) -
      2.166373 * this.pow__(number, 5) +
      1.848968 * this.pow__(number, 7)
    );
  }
  //arctg: from arcsin
  static arctan(number) {
    return this.arcsin(number / this.root(1 + this.pow__(number, 2), 2));
  }
  //arccos: from arcsin
  static arccos(number) {
    return this.pi / 2 - this.arcsin(number);
  }
  //arcctg: from arcsin
  static arccot(number) {
    return this.pi / 2 - this.arctan(number);
  }
}

export default myMath
