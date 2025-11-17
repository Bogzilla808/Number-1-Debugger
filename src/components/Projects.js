class Project {
    static UID = 0;
    static projectList = [];
  
    constructor(name, description, repoURL, created_by_user_id, created_at, projectMembers, testers, bugs) {
      this.Id = Project.UID++;
      this.name = name;
      this.description = description;
      this.repoURL = repoURL;
      this.created_by_user_id = created_by_user_id;
      this.created_at = created_at;
      this.projectMembers = projectMembers;
      this.testers = testers;
      this.bugs = bugs;
    }
  
    static addProject(projectName, description, repoURL) {
      const newProject = new Project(
        projectName,
        description,
        repoURL,
        Math.round(Math.random() * 100),
        new Date(),
        [],
        [],
        []
      );
      Project.projectList.push(newProject);
      alert(JSON.stringify(Project.projectList[0], null, 2));
    }
}
  
export default Project;