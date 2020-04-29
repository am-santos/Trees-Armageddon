/* 
  Game Ideas:

  Each team will make one shoot at a time
      - if more than one character per team, make them shoot one at a time.
  Team that reaches zero health first will loose

  User interactions per turn,
    - move worm -> set coordinates
    - sets direction -> left/right values
    - set shooting position -> up/down arrows
    - shoot
    
  Game calculations after user shoots gun,
    - set shoot trajectory
    - check shoot collision on each movement, until it is out of the canvas or collides with ground or any char
    - make shoot explode
    - calculate life for each char
    - update each char life
    - remove dead char
    - update board scores
    - check if any team has zero char left
    - assign winning team
    
    

*/
class Game {
  constructor($canvas) {
    this.$canvas = $canvas;
    this.context = $canvas.getContext('2d');

    this.width = $canvas.width;
    this.height = $canvas.height;

    // this.team1 = [];
    // this.team2 = [];

    this.eventRuns = false;

    this.characterTurn = 0;

    this.playing = false;

    this.setKeyBindings();
  }

  createsTeam(team, teamSize, orientation) {
    for (let i = 0; i < teamSize; i++) {
      let x = 50 + i * 70;
      if (orientation === 'left') {
        x = this.width - x - 20;
      }
      const char = new Character(this, orientation, x);
      team.push(char);
    }
    // team.push(orient);
  }

  drawTeam(team) {
    for (let character of team) {
      if (character.life > 0) {
        character.draw();
        character.gun.draw();
      }
    }
  }

  drawTeamsLife(team) {
    for (let character of team) {
      if (character.life > 0) {
        character.drawCharacterLife();
      }
    }
  }

  calculateTeamLife(team) {
    let charslife = [];
    for (let character of team) {
      charslife.push(character.life);
    }

    return charslife.reduce((acc, value) => acc + value, 0);
  }

  drawTeamTotalLife(team) {
    const context = this.context;

    const team1TotalLife = this.calculateTeamLife(this.team1);
    const team2TotalLife = this.calculateTeamLife(this.team2);

    context.save();
    // Draws Loosing life
    context.fillStyle = 'red';
    context.fillRect(50, 50, 300, 50); // make 300 has total life at the beginning
    context.fillRect(this.width - 300 - 50, 50, 300, 50); // make 300 has total life at the beginning

    // Draws Current total life
    // Team 1
    context.fillStyle = 'limegreen';
    context.fillRect(50, 50, 300 * (team1TotalLife / 300), 50);
    // Team 2
    context.fillStyle = 'limegreen';
    context.fillRect(this.width - 300 - 50, 50, 300 * (team2TotalLife / 300), 50);
    context.restore();

    // Writes Team Names
    context.save();
    context.fillStyle = 'black';
    context.font = '50px serif';
    context.fillText('A - Team', 100, 45, 200);
    context.fillText('B - Team', this.width - 300, 45, 200);
    context.restore();
  }

  gameLogic() {
    this.drawCurrentStatus();

    this.currentTeam = this.currentTeam === this.team1 ? this.team2 : this.team1;

    this.currentCharacterIndex++;

    if (this.currentCharacterIndex > 2) {
      this.currentCharacterIndex = 0;
    }
  }

  start() {
    // this.reset();
    // this.gameLogic();
    this.playing = true;
  }

  reset() {
    this.clearEverything();
    this.ground = new Ground(this);
    this.ground.draw();

    this.team1 = [];
    this.team2 = [];

    this.createsTeam(this.team1, 3, 'right');
    this.drawTeam(this.team1);
    this.drawTeamsLife(this.team1);
    this.drawTeamTotalLife(this.team1);

    this.createsTeam(this.team2, 3, 'left');
    this.drawTeam(this.team2);
    this.drawTeamsLife(this.team2);
    this.drawTeamTotalLife(this.team2);

    this.currentTeam = this.team1;
    this.currentCharacterIndex = 0;
  }

  clearEverything() {
    this.context.clearRect(0, 0, this.width, this.height);
  }

  drawCurrentStatus() {
    this.clearEverything();
    this.ground.draw();
    this.drawTeam(this.team1);
    this.drawTeam(this.team2);
    this.drawTeamsLife(this.team1);
    this.drawTeamsLife(this.team2);
    this.drawTeamTotalLife(this.team1);
    this.drawTeamTotalLife(this.team2);
  }

  runLogic() {
    // Corrias a lógica de update de projecteis que estivessem no ar
  }

  draw() {
    // Apagas tudo e chamas draw em cada character, projectile, scores, etc
  }

  loop() {
    this.runLogic();
    this.draw();
    setTimeout(() => {
      this.loop();
    }, 1000 / 60);
  }

  setKeyBindings() {
    // teamName[charNumber][className].method
    // teamName - array with team chars
    // charNumber - specific char that is being refered
    // className - {char,gun,proj} - that represents each class specifications.

    window.addEventListener('keydown', (event) => {
      // event.preventDefault();
      const teamMembers = this.currentTeam;
      const characterNumber = this.currentCharacterIndex;
      const character = teamMembers[characterNumber];

      if (this.playing && !this.eventRuns) {
        const keyCode = event.keyCode;
        switch (keyCode) {
          case 37: // Left
            character.move('left');
            character.gun = new Gun(character);
            this.clearEverything();
            this.drawCurrentStatus();
            break;
          case 39: // Right
            character.move('right');
            character.gun = new Gun(character);
            this.clearEverything();
            this.drawCurrentStatus();
            break;
          case 38: // Up
            character.gun.pointsTo('up');
            this.clearEverything();
            this.drawCurrentStatus();
            break;
          case 40: // Down
            character.gun.pointsTo('down');
            this.clearEverything();
            this.drawCurrentStatus();
            break;
          case 32: // Space Bar
            this.clearEverything();
            this.drawCurrentStatus();
            character.gun.projectile = new Projectile(character.gun);
            character.gun.projectile.shootsInMotion(teamMembers);
        }
      }
    });
  }
}
