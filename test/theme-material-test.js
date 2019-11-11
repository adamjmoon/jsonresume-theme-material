var theme = require("../index.js");
var resume = require("../resume.json");
var chai = require("chai");
var expect = chai.expect;

describe('theme', function () {
  describe('render', function () {
    
   
    it('should render html with correct html tag', function () {
      var resumeHTML = theme.render(resume);
      expect(resumeHTML.indexOf("html>")).to.be.greaterThan(-1);
    });
  
  });
});