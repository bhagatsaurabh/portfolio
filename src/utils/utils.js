export const extractProjectTags = (projects) => {
  let data = {
    dateTags: new Set(),
    nameTags: new Set(),
    technologyTags: new Set(),
    typeTags: new Set()
  }
  projects.forEach(project => {
    data.dateTags.add(project.start.split(' ')[1]);
    data.nameTags.add(project.name.charAt(0).toLowerCase());
    project.technology.forEach(technology => {
      data.technologyTags.add(technology);
    });
    data.typeTags.add(project.type);
  });

  for (let key in data) {
    data[key] = Array.from(data[key]);
  }
  return data;
};

export const isNear = (a, b) => {
  return (Math.abs(Math.floor(a) - Math.floor(b)) <= 2);
};

export const generateUUID = () => {
  var S4 = function () {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };
  return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}

export const sortTags = (a, b, direction, sortBy) => {
  if (!direction) {
    let temp = a;
    a = b;
    b = temp;
  }
  switch (sortBy) {
    case 'date': return parseInt(a) - parseInt(b);
    case 'name':
    case 'technology':
    case 'type': {
      if (a < b)
        return -1;
      if (a > b)
        return 1;
      return 0;
    }
    default: return a - b;
  }
};

export const applyTagToProjects = (tag, groupBy, projects) => {
  switch (groupBy) {
    case 'date':
      return projects.filter(project => tag === project.start.split(' ')[1]);
    case 'name':
      return projects.filter(project => tag === project.name.charAt(0).toLowerCase());
    case 'technology':
      return projects.filter(project => project.technology.includes(tag));
    case 'type':
      return projects.filter(project => project.type.includes(tag));
    default: return [];
  }
};

export const filterProjectsBySearch = (query, projects) => {
  return projects.map(section => {
    return {
      tag: section.tag,
      projects: section.projects.filter(project => project.name.includes(query) || project.description.includes(query))
    };
  }).filter(section => section.projects.length > 0);
};

let aDay = 60 * 60 * 24;
export const diffYears = (date2, date1) => {
  let diff = (date2.getTime() - date1.getTime()) / 1000;
  diff /= aDay;
  return Math.abs(diff / 365.25);
};
export const diffMonths = (date2, date1) => {
  let diff = (date2.getTime() - date1.getTime()) / 1000;
  diff /= aDay;
  return Math.abs(diff / 30.41);
}

export const computeExperience = (skills, projects) => {
  let computedSkills = {};
  let webAPIs = ['HTML5 canvas', 'web socket', 'web audio', 'web RTC', 'indexed DB', 'web worker'];

  projects.forEach(project => {
    project.technology.forEach(technology => {
      if (computedSkills[technology]) {
        let startDate = new Date(project.start);
        let endDate = project.end === 'Ongoing' ? new Date() : new Date(project.end);
        computedSkills[technology].months += diffMonths(endDate, startDate) + 1;
        computedSkills[technology].noOfProjects += 1;
      } else {
        computedSkills[technology] = {
          noOfProjects: 1,
          months: project.end === 'Ongoing' ? diffMonths(new Date(), new Date(project.start)) + 1 : diffMonths(new Date(project.end), new Date(project.start)) + 1
        };
      }
    });
  });

  computedSkills['web APIs'] = { noOfProjects: 0, months: 0 };
  Object.keys(computedSkills).forEach(key => {
    if (webAPIs.includes(key)) {
      computedSkills['web APIs'].noOfProjects += computedSkills[key].noOfProjects;
      computedSkills['web APIs'].months += computedSkills[key].months
      delete computedSkills[key];
    }
  });

  skills.forEach(role => {
    role.skills.forEach(skill => {
      if (computedSkills[skill.tag]) {
        skill.years = (computedSkills[skill.tag].months / 12).toFixed(1);
        skill.noOfProjects = computedSkills[skill.tag].noOfProjects;
      }
    });
  });
};
