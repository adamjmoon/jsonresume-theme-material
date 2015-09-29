var theme = require("../index.js");
var resume = require("resume-schema").resumeJson;
var chai = require("chai");
var expect = chai.expect;

describe('theme', function () {
  var resumeHTML = theme.render(resume);
  it('should render html from resume json', function () {
    expect(resumeHTML.length).to.be.greaterThan(0);
  });

  it('should render html with correct html tag', function () {
    expect(resumeHTML.indexOf("html>")).to.be.greaterThan(-1);
  });

});