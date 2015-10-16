var fs = require('fs');
var _ = require('lodash');
var Mustache = require('mustache');
var gravatar = require('gravatar');

var d = new Date();
var curyear = d.getFullYear();

function getMonth(startDateStr) {
  switch (startDateStr.substr(5, 2)) {
  case '01':
    return "January ";
  case '02':
    return "February ";
  case '03':
    return "March ";
  case '04':
    return "April ";
  case '05':
    return "May ";
  case '06':
    return "June ";
  case '07':
    return "July ";
  case '08':
    return "August ";
  case '09':
    return "September ";
  case '10':
    return "October ";
  case '11':
    return "November ";
  case '12':
    return "December ";
  }
}

function render(resume, themeOptions) {

  if (resume.basics && resume.basics.length > 0) {
    resume.basics = resume.basics[0];
  }

  if (resume.basics && resume.basics.name) {
    resume.basics.capitalName = resume.basics.name.toUpperCase();
  }

  if (resume.basics && resume.basics.profiles) {
    _.each(resume.basics.profiles, function (p) {
      switch (p.network.toLowerCase()) {
      case "facebook":
        p.iconClass = "fa fa-facebook-square";
        break;
      case "github":
        p.iconClass = "fa fa-github-square";
        break;
      case "twitter":
        p.iconClass = "fa fa-twitter-square";
        break;
      case "googlePlus":
      case "google-plus":
      case "googleplus":
        p.iconClass = "fa fa-google-plus-square";
        break;
      case "youtube":
      case "YouTube":
        p.iconClass = "fa fa-youtube-square";
        break;
      case "vimeo":
        p.iconClass = "fa fa-vimeo-square";
        break;
      case "linkedin":
        p.iconClass = "fa fa-linkedin-square";
        break;
      case "pinterest":
        p.iconClass = "fa fa-pinterest-square";
        break;
      case "flickr":
      case "flicker":
        p.iconClass = "fa fa-flickr";
        break;
      case "behance":
        p.iconClass = "fa fa-behance-square";
        break;
      case "dribbble":
      case "dribble":
        p.iconClass = "fa fa-dribbble";
        break;
      case "codepen":
      case "codePen":
        p.iconClass = "fa fa-codepen";
        break;
      case "soundcloud":
      case "soundCloud":
        p.iconClass = "fa fa-soundcloud";
        break;
      case "steam":
        p.iconClass = "fa fa-steam";
        break;
      case "reddit":
        p.iconClass = "fa fa-reddit";
        break;
      case "tumblr":
      case "tumbler":
        p.iconClass = "fa fa-tumblr-square";
        break;
      case "stack-overflow":
      case "stackOverflow":
        p.iconClass = "fa fa-stack-overflow";
        break;
      case "bitbucket":
        p.iconClass = "fa fa-bitbucket";
        break;
      case "blog":
      case "rss":
        p.iconClass = "fa fa-rss-square";
        break;
      }

      if (p.url) {
        p.text = p.url;
      } else {
        p.text = p.network + ": " + p.username;
      }
    });
  }

  if (resume.work && resume.work.length) {
    _.each(resume.work, function (w) {
      if (w.startDate) {
        w.startDateYear = (w.startDate || "").substr(0, 4);
        w.startDateMonth = getMonth(w.startDate || "");

      }
      if (w.endDate) {
        w.endDateYear = (w.endDate || "").substr(0, 4);
        w.endDateMonth = getMonth(w.endDate || "");
      } else {
        w.endDateYear = 'Present';
      }
      if (w.highlights) {
        if (w.highlights[0]) {
          if (w.highlights[0] !== "") {
            w.boolHighlights = true;
          }
        }
      }
    });
  }

  if (resume.volunteer && resume.volunteer.length) {
    _.each(resume.volunteer, function (w) {
      if (w.startDate) {
        w.startDateYear = (w.startDate || "").substr(0, 4);
        w.startDateMonth = getMonth(w.startDate || "");

      }
      if (w.endDate) {
        w.endDateYear = (w.endDate || "").substr(0, 4);
        w.endDateMonth = getMonth(w.endDate || "");
      } else {
        w.endDateYear = 'Present';
      }
      if (w.highlights) {
        if (w.highlights[0]) {
          if (w.highlights[0] !== "") {
            w.boolHighlights = true;
          }
        }
      }
    });
  }

  if (!resume.basics.picture && hasEmail(resume)) {
    resume.basics.picture = gravatar.url(resume.basics.email.replace('(at)', '@'), {
      s: '60',
      r: 'pg',
      d: '404'
    });
  }

  function hasEmail(resume) {
    return !!resume.basics && !! resume.basics.email;
  }

  if (resume.education && resume.education.length) {
    if (resume.education[0].institution) {
      _.each(resume.education, function (e) {
        if (!e.area || !e.studyType) {
          e.educationDetail = (e.area === null ? '' : e.area) + (e.studyType === null ? '' : e.studyType);
        } else {
          e.educationDetail = e.area + ", " + e.studyType;
        }
        if (e.startDate) {
          e.startDateYear = e.startDate.substr(0, 4);
          e.startDateMonth = getMonth(e.startDate || "");
        } else {
          e.endDateMonth = "";
        }
        if (e.endDate) {
          e.endDateYear = e.endDate.substr(0, 4);
          e.endDateMonth = getMonth(e.endDate || "");

          if (e.endDateYear > curyear) {
            e.endDateYear += " (expected)";
          }
        } else {
          e.endDateYear = 'Present'
          e.endDateMonth = '';
        }
        if (e.courses) {
          if (e.courses[0]) {
            if (e.courses[0] !== "") {
              e.educationCourses = true;
            }
          }
        }
      });
    }
  }

  if (resume.awards && resume.awards.length) {
    if (resume.awards[0].title) {
      _.each(resume.awards, function (a) {
        a.year = (a.date || "").substr(0, 4);
        a.day = (a.date || "").substr(8, 2);
        a.month = getMonth(a.date || "");
      });
    }
  }

  if (resume.publications && resume.publications.length) {
    if (resume.publications[0].name) {
      _.each(resume.publications, function (a) {
        a.year = (a.releaseDate || "").substr(0, 4);
        a.day = (a.releaseDate || "").substr(8, 2);
        a.month = getMonth(a.releaseDate || "");
      });
    }
  }

  resume.css = fs.readFileSync(__dirname + "/style.css", "utf-8");
  resume.printcss = fs.readFileSync(__dirname + "/print.css", "utf-8");
  var theme = fs.readFileSync(__dirname + '/resume.template', 'utf8');
  resume.inYears = (function (_firstJobStartDateStr) {
    var firstJobStartDate = new Date(_firstJobStartDateStr);
    return function () {
      return (new Date()).getFullYear() - firstJobStartDate.getFullYear();
    };
  })(resume.work[resume.work.length - 1].startDate);
  
  resume.themeOptions = themeOptions;
  var resumeHTML = Mustache.render(theme, resume);


  return resumeHTML;
}
module.exports = {
  render: render
};