---
name: aiwb-add-skill
description: Review a GitHub repository and safely add one user-approved Agent Skill to the personal AI Workbench for reuse across projects.
---

Use the `aiwb-add-skill` skill. Inspect the repository URL the user provides, identify the relevant skill and license, review its instructions and support files without executing upstream code, and summarize its behavior and risks. Ask the user to approve the specific skill before importing. Then use `aiwb add skill <repo> -SkillPath <path>` to add only the selected skill, and explain that `aiwb updateSkills` deploys it to an initialized project.
