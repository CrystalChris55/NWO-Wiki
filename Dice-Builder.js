// NWO Character Builder gadget – mounts into <div id="nwo-builder">
(function (mw, $) {
  'use strict';

  function shouldRun($root) {
    if ($root && $root.length) return true;
    return false;
  }

  function mount() {
    var $root = $('#nwo-builder').first();
    if (!$root.length || $root.data('mounted')) return;
    if (!shouldRun($root)) return;

    $root.addClass('nwo-builder').data('mounted', true);

    $root.html(
      '<div class="wrap">' +
        '<h1>NWO Character Builder (2d6)</h1>' +
        '<p class="muted">Pick a Background, add Traits & Skill Traits, then test 2d6 rolls with the live modifier. Built for the No Way Out dice rules.</p>' +
        '<div class="grid">' +
          '<div class="card"><div class="hd">1) Background, Trait Points & Selections</div><div class="bd" id="bg-area"></div></div>' +
          '<div class="card"><div class="hd">2) 2d6 Test Roller (WORK IN PROGRESS) </div><div class="bd" id="roller-area"></div></div>' +
        '</div>' +
        '<div class="grid" style="margin-top:12px">' +
          '<div class="card"><div class="hd">3) Traits & Skills</div><div class="bd" id="traits-area"></div></div>' +
          '<div class="card"><div class="hd">4) Build Summary & Modifiers</div><div class="bd" id="summary-area"></div></div>' +
        '</div>' +
        '<p class="kudos">Rules referenced from the NWO <em>Dice Guide</em>. ' +
        '<a href="/wiki/Dice_Guide" style="color:var(--accent)">See the Dice Guide</a>.</p>' +
      '</div>'
    );

    /* =========================
       Traits & Skills Table
       ========================= */

    var BACKGROUNDS = {
      Survivor: {
        traitPoints: 12, base: { Strength: 6, Fitness: 6, Perception: 2  },
        freeTraits: [
        ]
      }
    };


    var POSITIVE_TRAITS = [
      { name: 'Adrenaline Junkie',  cost: 2, effects: { Initiative: 1 } },
      { name: 'Brave',              cost: 2, effects: { Resolve: 2 } },
      { name: 'Brewer',             cost: 2, effects: { Brewing: 2 } },
      { name: 'Cats Eyes',          cost: 2, effects: { Perception: 1 } },
      { name: 'Desensitized',       cost: 3, effects: { Resolve: 3 } },
      { name: 'Dexterous',          cost: 2, effects: {} },
      { name: 'Eagle Eyed',         cost: 3, effects: { 'Ranged Attack': 1, Perception: 1 } },
      { name: 'Fast Healer',        cost: 2, effects: { Robustness: 1 } },
      { name: 'Fast Learner',       cost: 2, effects: {} },
      { name: 'Fast Reader',        cost: 1, effects: {} },
      { name: 'Fit',                cost: 2, effects: { Fitness: 2 } },
      { name: 'Graceful',           cost: 1, effects: { Hiding: 1 } },
      { name: 'Herbalist',          cost: 1, effects: {} },
      { name: 'Inconspicuous',      cost: 1, effects: { Hiding: 1 } },
      { name: 'Iron Gut',           cost: 2, effects: { Robustness: 1 } },
      { name: 'Keen Hearing',       cost: 2, effects: { Perception: 1 } },
      { name: 'Light Eater',        cost: 2, effects: {} },
      { name: 'Low Thirst',         cost: 2, effects: {} },
      { name: 'Organized',          cost: 2, effects: {} },
      { name: 'Outdoorsman',        cost: 2, effects: { Robustness: 1 } },
      { name: 'Resilient',          cost: 2, effects: { Robustness: 1 } },
      { name: 'Speed Demon',        cost: 1, effects: { Resolve: 1 } },
      { name: 'Strong',             cost: 2, effects: { Strength: 2 } },
      { name: 'Thick Skinned',      cost: 2, effects: { Robustness: 2 } },
      { name: 'Very Fit',           cost: 4, effects: { Fitness: 4 } },
      { name: 'Very Strong',        cost: 4, effects: { Strength: 4 } }
    ];

    var NEGATIVE_TRAITS = [
      { name: 'Agoraphobic',        cost: 1, effects: { Resolve: -1 } },
      { name: 'All Thumbs',         cost: 1, effects: {} },
      { name: 'Claustrophobic',     cost: 1, effects: { Resolve: -1 } },
      { name: 'Clumsy',             cost: 1, effects: { Hiding: -1 } },
      { name: 'Conspicuous',        cost: 1, effects: { Hiding: -1 } },
      { name: 'Cowardly',           cost: 2, effects: { Resolve: -2 } },
      { name: 'Deaf',               cost: 4, effects: { Perception: -4 } },
      { name: 'Disorganized',       cost: 1, effects: {} },
      { name: 'Fear of Blood',      cost: 1, effects: { Resolve: -1 } },
      { name: 'Hard of Hearing',    cost: 2, effects: { Perception: -2 } },
      { name: 'Hearty Appetite',    cost: 1, effects: {} },
      { name: 'High Thirst',        cost: 2, effects: {} },
      { name: 'Illiterate',         cost: 2, effects: {} },
      { name: 'Pacifist',           cost: 3, effects: { Initiative: -2 } },
      { name: 'Prone to Illness',   cost: 1, effects: { Robustness: -1 } },
      { name: 'Short Sighted',      cost: 2, effects: { 'Ranged Attack': -1, Perception: -1 } },
      { name: 'Slow Healer',        cost: 1, effects: { Robustness: -1 } },
      { name: 'Slow Learner',       cost: 1, effects: {} },
      { name: 'Slow Reader',        cost: 1, effects: {} },
      { name: 'Smoker',             cost: 1, effects: { Robustness: -1 } },
      { name: 'Sunday Driver',      cost: 1, effects: {} },
      { name: 'Thin Skinned',       cost: 2, effects: { Robustness: -2 } },
      { name: 'Unfit',              cost: 2, effects: { Fitness: -2 } },
      { name: 'Very Unfit',         cost: 4, effects: { Fitness: -4 } },
      { name: 'Very Weak',          cost: 4, effects: { Strength: -4 } },
      { name: 'Weak',               cost: 2, effects: { Strength: -2 } },
      { name: 'Weak Stomach',       cost: 1, effects: {} }
    ];

    var SKILL_TIERS = {
      Amateur:     { cost: 1, start: 6,  cap: 6,  limitPerChar: Infinity },
      Experienced: { cost: 2, start: 8,  cap: 8,  limitPerChar: 2 },
      Expert:      { cost: 3, start: 10, cap: 10, limitPerChar: 1 }
    };


    var SKILL_GROUPS = [
      { key: 'Mechanic',     label: 'Mechanic',     list: ['Mechanics'] },
      { key: 'Tailor',       label: 'Tailor',       list: ['Tailoring'] },
      { key: 'Doctor',       label: 'Doctor',       list: ['First Aid'] },
      { key: 'Electrical',   label: 'Electrical',   list: ['Electronics'] },
      { key: 'Metalworker',  label: 'Metalworker',  list: ['Metalworking'] },
      { key: 'Homesteader',  label: 'Homesteader',  list: ['Cooking', 'Farming', 'Carpentry'] },
      { key: 'Shooter',      label: 'Shooter',      list: ['Aiming', 'Reloading'] },
      { key: 'OutdoorsmanS', label: 'Outdoorsman',  list: ['Fishing', 'Foraging', 'Trapping'] },
      { key: 'Athlete',      label: 'Athlete',      list: ['Nimble', 'Sprinting'] },
      { key: 'Rogue',        label: 'Rogue',        list: ['Sneaking', 'Lightfooted'] },
      { key: 'FighterSurv',  label: 'Fighter (Survival)', list: ['Axe', 'Spear', 'Maintenance'] },
      { key: 'FighterBlunt', label: 'Fighter (Blunt)',    list: ['Long Blunt', 'Short Blunt', 'Maintenance'] },
      { key: 'FighterBlade', label: 'Fighter (Blade)',    list: ['Long Blade', 'Short Blade', 'Maintenance'] }
    ];

    /* =========================
       Math & Logic
       ========================= */

    var CHECKS = [
      'Strength','Fitness','Perception','Resolve','Initiative','Robustness',
      'Melee Attack','Melee Defence','Ranged Attack',
      'Carpentry','Farming','First Aid','Mechanics','Electronics','Metalworking',
      'Cooking','Tailoring','Aiming','Reloading','Fishing','Foraging','Trapping',
      'Nimble','Sprinting','Sneaking','Lightfooted','Hiding','Axe','Spear',
      'Maintenance','Long Blunt','Short Blunt','Long Blade','Short Blade'
    ];

    var state = { background: 'Survivor', pos: new Set(), neg: new Set(), skills: {} };

    function ensureMetric(breakdown, key) {
      if (!breakdown[key]) breakdown[key] = { base: 0, traits: 0, skills: 0, derived: 0, total: 0 };
    }

    function getSkillModByLevel(level) {
      return Math.floor((level || 0) / 2);
    }

    function getTierStart(tierName) {
      var def = SKILL_TIERS[tierName];
      return def ? (def.start || 0) : 0;
    }

    function calcMaxHP(fitness) {
      if (fitness >= 10) return 6;
      if (fitness >= 8)  return 5;
      if (fitness >= 6)  return 4;
      if (fitness >= 4)  return 3;
      return 2;
    }


    function currentSkillLevels() {
      var out = Object.create(null);
      var i, group, tier, lv, s, name;
      for (i = 0; i < SKILL_GROUPS.length; i++) {
        group = SKILL_GROUPS[i];
        tier  = state.skills[group.key];
        if (!tier) continue;
        lv = getTierStart(tier);
        for (s = 0; s < group.list.length; s++) {
          name = group.list[s];
          if (!out[name]) out[name] = 0;
          out[name] += lv; // ADD levels if multiple groups touch same skill
        }
      }
      return out;
    }

    function sumEffects() {
      var breakdown = {};
      var i;

      for (i = 0; i < CHECKS.length; i++) {
        breakdown[CHECKS[i]] = { base: 0, traits: 0, skills: 0, derived: 0, total: 0 };
      }

      var bg = BACKGROUNDS[state.background];
      breakdown.Strength.base   = bg.base.Strength;
      breakdown.Fitness.base    = bg.base.Fitness;
      breakdown.Perception.base = bg.base.Perception;
      breakdown.Resolve.base    = 0;

      // Positive traits
      for (i = 0; i < POSITIVE_TRAITS.length; i++) {
        var pt = POSITIVE_TRAITS[i];
        if (state.pos.has(pt.name)) {
          for (var k1 in pt.effects) if (pt.effects.hasOwnProperty(k1)) {
            ensureMetric(breakdown, k1);
            breakdown[k1].traits += pt.effects[k1];
          }
        }
      }
      // Negative traits
      for (i = 0; i < NEGATIVE_TRAITS.length; i++) {
        var nt = NEGATIVE_TRAITS[i];
        if (state.neg.has(nt.name)) {
          for (var k2 in nt.effects) if (nt.effects.hasOwnProperty(k2)) {
            ensureMetric(breakdown, k2);
            breakdown[k2].traits += nt.effects[k2];
          }
        }
      }
      // Background freebies
      for (i = 0; i < bg.freeTraits.length; i++) {
        var ft = bg.freeTraits[i];
        for (var k3 in ft.effects) if (ft.effects.hasOwnProperty(k3)) {
          ensureMetric(breakdown, k3);
          breakdown[k3].traits += ft.effects[k3];
        }
      }

// Skill levels into roll modifiers.
var lvMap = currentSkillLevels();
Object.keys(lvMap).forEach(function (skillName) {
  var level = lvMap[skillName];
  var mod   = getSkillModByLevel(level);

  
  if (skillName === 'Aiming') {
    ensureMetric(breakdown, 'Ranged Attack'); breakdown['Ranged Attack'].skills += mod;
  }
  
  else if (skillName === 'Nimble') {
    ensureMetric(breakdown, 'Nimble');     breakdown.Nimble.skills     += mod;
      // ADD: Half of Nimble level to Melee Attack and Melee Defence
    var halfNimble = Math.floor(level / 2);
    ensureMetric(breakdown, 'Melee Attack'); breakdown['Melee Attack'].skills += halfNimble;
    ensureMetric(breakdown, 'Melee Defence'); breakdown['Melee Defence'].skills += halfNimble;
  }
  else if (skillName === 'Sneaking') {
    ensureMetric(breakdown, 'Hiding'); breakdown.Hiding.skills += mod;
  }
  // All skills add half their level to their own check
  ensureMetric(breakdown, skillName);
  breakdown[skillName].skills += mod;
});



      breakdown.Strength.total = breakdown.Strength.base + breakdown.Strength.traits;
      var str = breakdown.Strength.total;
      if (str <= 4)       { breakdown['Melee Attack'].derived += -1; breakdown['Melee Defence'].derived += -1; }
      else if (str <= 6)  { /* no mod */ }
      else if (str <= 8)  { breakdown['Melee Attack'].derived += 1;  breakdown['Melee Defence'].derived += 1; }
      else if (str >= 10) { breakdown['Melee Attack'].derived += 2;  breakdown['Melee Defence'].derived += 2; }

      
      var weaponSkills = ['Long Blunt', 'Short Blunt', 'Long Blade', 'Short Blade', 'Axe', 'Spear'];
      for (i = 0; i < weaponSkills.length; i++) {
        var ws = weaponSkills[i];
        ensureMetric(breakdown, ws);
        if (str <= 4)       breakdown[ws].derived += -1;
        else if (str <= 6)  { /* no mod */ }
        else if (str <= 8)  breakdown[ws].derived += 1;
        else if (str >= 10) breakdown[ws].derived += 2;
      }


      breakdown.Fitness.total = breakdown.Fitness.base + breakdown.Fitness.traits;
      var fitMod = Math.max(Math.floor((breakdown.Fitness.total - 6) / 2), 0);
      breakdown.Robustness.derived += fitMod;


      for (i = 0; i < CHECKS.length; i++) {
        var key = CHECKS[i];
        var m = breakdown[key];
        m.total = (m.base || 0) + (m.traits || 0) + (m.skills || 0) + (m.derived || 0);
      }

      breakdown.MaxHP = { value: calcMaxHP(breakdown.Fitness.total) };
      return breakdown;
    }

    function spend() {
      var pts = BACKGROUNDS[state.background].traitPoints, i, tier;
      for (i = 0; i < POSITIVE_TRAITS.length; i++) if (state.pos.has(POSITIVE_TRAITS[i].name)) pts -= POSITIVE_TRAITS[i].cost;
      for (i = 0; i < NEGATIVE_TRAITS.length; i++) if (state.neg.has(NEGATIVE_TRAITS[i].name)) pts += NEGATIVE_TRAITS[i].cost;
      for (var key in state.skills) if (state.skills.hasOwnProperty(key)) {
        tier = state.skills[key];
        pts -= SKILL_TIERS[tier].cost;
      }
      return pts;
    }

    function skillTierCounts() {
      var exp = 0, ex = 0, tier, key;
      for (key in state.skills) if (state.skills.hasOwnProperty(key)) {
        tier = state.skills[key];
        if (tier === 'Experienced') exp++;
        if (tier === 'Expert')      ex++;
      }
      return { exp: exp, ex: ex };
    }

    /* =========================
       Rendering
       ========================= */

    function renderBackground() {
      var bg = BACKGROUNDS[state.background], i;

      var opts = '', keys = Object.keys(BACKGROUNDS);
      for (i = 0; i < keys.length; i++) {
        var k = keys[i];
        opts += '<option value="' + k + '"' + (state.background === k ? ' selected' : '') + '>' + k + '</option>';
      }

      var freebies = '';
      for (i = 0; i < bg.freeTraits.length; i++) {
        freebies += '<span class="pill">' + bg.freeTraits[i].name + '</span>';
      }

      var used = (bg.traitPoints - spend());
      var html =
        '<label>Background</label>' +
        '<select id="backgroundSel">' + opts + '</select>' +
        '<div class="totals section">' +
          '<span class="pill">Trait Points: <b>' + bg.traitPoints + '</b></span>' +
          '<span class="pill">Base Strength: <b>' + bg.base.Strength + '</b></span>' +
          '<span class="pill">Base Fitness: <b>' + bg.base.Fitness + '</b></span>' +
          '<span class="pill">Base Perception: <b>' + bg.base.Perception + '</b></span>' +
          freebies +
        '</div>' +
        '<div class="muted section">Background gives Trait Points, base Strength/Fitness, and two thematic traits.</div>' +
        '<div class="totals section">' +
          '<span class="pill">Trait Points Used: <b>' + used + '</b></span>' +
          '<span class="pill ' + (spend() < 0 ? 'warning' : 'success') + '">Remaining: <b>' + spend() + '</b></span>' +
        '</div>';

      $('#bg-area').html(html);
      $('#backgroundSel').off('change input').on('change input', function (e) {
        state.background = e.target.value;
        renderAll();
      });
    }

    function renderTraitsAndSkills() {
      var prevPosOpen = $('#posDetails').prop('open');
      var prevNegOpen = $('#negDetails').prop('open');
      if (typeof prevPosOpen === 'undefined') prevPosOpen = true;
      if (typeof prevNegOpen === 'undefined') prevNegOpen = true;

      var counts = skillTierCounts();

      var html =
        '<details id="posDetails">' +
          '<summary><strong>Positive Traits</strong> <span class="small">(costs subtract from your points)</span></summary>' +
          '<div class="list" id="positives"></div>' +
        '</details>' +
        '<details id="negDetails" style="margin-top:12px">' +
          '<summary><strong>Negative Traits</strong> <span class="small">(refund points)</span></summary>' +
          '<div class="list" id="negatives"></div>' +
        '</details>' +
        '<div class="section" style="margin-top:12px">' +
          '<strong>Skill Traits</strong>' +
          '<div class="small">Amateur (1 pt, L6 cap), Experienced (2 pts, L8 cap, <b>max 2</b>), Expert (3 pts, L10 cap, <b>max 1</b>). One tier per skill group.</div>' +
          '<div id="skills"></div>' +
          '<div class="totals section">' +
            '<span class="pill">Experienced: <b>' + counts.exp + '/2</b></span>' +
            '<span class="pill">Expert: <b>' + counts.ex + '/1</b></span>' +
          '</div>' +
        '</div>';

      $('#traits-area').html(html);
      $('#posDetails').prop('open', !!prevPosOpen);
      $('#negDetails').prop('open', !!prevNegOpen);

      // Positives
      var posHtml = '', i, k, v;
      for (i = 0; i < POSITIVE_TRAITS.length; i++) {
        var t = POSITIVE_TRAITS[i];
        var id = 'pos_' + t.name.replace(/\s+/g, '_');
        var checked = state.pos.has(t.name) ? 'checked' : '';
        var mods = '';
        for (k in t.effects) if (t.effects.hasOwnProperty(k)) {
          v = t.effects[k];
          mods += '<span class="tag">' + k + ': ' + (v > 0 ? '+' : '') + v + '</span>';
        }
        posHtml += '<label class="checkbox"><input type="checkbox" id="' + id + '" ' + checked + '/> ' +
                   '<div><b>' + t.name + '</b> <span class="muted">(cost ' + t.cost + ')</span>' +
                   '<div class="flex">' + mods + '</div></div></label>';
      }
      $('#positives').html(posHtml);
      for (i = 0; i < POSITIVE_TRAITS.length; i++) (function (t) {
        $('#pos_' + t.name.replace(/\s+/g, '_')).off('change').on('change', function (e) {
          if (e.target.checked) state.pos.add(t.name); else state.pos.delete(t.name);
          renderAll();
        });
      })(POSITIVE_TRAITS[i]);

      // Negatives
      var negHtml = '';
      for (i = 0; i < NEGATIVE_TRAITS.length; i++) {
        var nt = NEGATIVE_TRAITS[i];
        var nid = 'neg_' + nt.name.replace(/\s+/g, '_');
        var nchecked = state.neg.has(nt.name) ? 'checked' : '';
        var nmods = '';
        for (k in nt.effects) if (nt.effects.hasOwnProperty(k)) {
          v = nt.effects[k];
          nmods += '<span class="tag">' + k + ': ' + (v > 0 ? '+' : '') + v + '</span>';
        }
        negHtml += '<label class="checkbox"><input type="checkbox" id="' + nid + '" ' + nchecked + '/> ' +
                   '<div><b>' + nt.name + '</b> <span class="muted">(refund ' + nt.cost + ')</span>' +
                   '<div class="flex">' + nmods + '</div></div></label>';
      }
      $('#negatives').html(negHtml);
      for (i = 0; i < NEGATIVE_TRAITS.length; i++) (function (t) {
        $('#neg_' + t.name.replace(/\s+/g, '_')).off('change').on('change', function (e) {
          if (e.target.checked) state.neg.add(t.name); else state.neg.delete(t.name);
          renderAll();
        });
      })(NEGATIVE_TRAITS[i]);

      // Skills
      var skillsHtml = '';
      for (i = 0; i < SKILL_GROUPS.length; i++) {
        var s = SKILL_GROUPS[i];
        var val = state.skills[s.key] || '';
        var scounts = skillTierCounts();
        var opts = '';
        var tiers = ['', 'Amateur', 'Experienced', 'Expert'];
        for (var ti = 0; ti < tiers.length; ti++) {
          var tier = tiers[ti];
          if (tier === '') {
            opts += '<option value=""' + (val === '' ? ' selected' : '') + '>None</option>';
          } else if (tier === 'Experienced' && scounts.exp >= 2 && val !== tier) {
            opts += '<option disabled>Experienced (max 2)</option>';
          } else if (tier === 'Expert' && scounts.ex >= 1 && val !== tier) {
            opts += '<option disabled>Expert (max 1)</option>';
          } else {
            var tdata = SKILL_TIERS[tier];
            var lab = tier + ' — cost ' + tdata.cost + ', start L' + tdata.start + ', cap ' + tdata.cap;
            opts += '<option ' + (val === tier ? 'selected' : '') + ' value="' + tier + '">' + lab + '</option>';
          }
        }

        var shownStart = val ? getTierStart(val) : 0;
        var shownMod   = val ? getSkillModByLevel(shownStart) : 0;

        skillsHtml +=
          '<div class="row" style="align-items:center;margin:6px 0">' +
            '<div><b>' + s.label + '</b> <span class="small muted">(' + s.list.join(', ') + ')</span></div>' +
            '<div><select id="skill_' + s.key + '">' + opts + '</select></div>' +
            '<div class="small" style="grid-column:1 / -1; color:var(--muted)">' +
              'Level: <b>' + shownStart + '</b> • Modifier: <b>' + shownMod + '</b>' +
            '</div>' +
          '</div>';
      }
      $('#skills').html(skillsHtml);
      for (i = 0; i < SKILL_GROUPS.length; i++) (function (key) {
        $('#skill_' + key).off('change').on('change', function (e) {
          var v = e.target.value || null;
          if (v) state.skills[key] = v; else delete state.skills[key];
          renderAll();
        });
      })(SKILL_GROUPS[i].key);
    }

    /* ---------- Summary & Roller ---------- */

    var ROLL_CHECKS = [
      'Melee Attack','Melee Defence','Ranged Attack','Reloading',
      'Perception','Resolve','Initiative','Robustness',
      'First Aid','Nimble','Hiding'
    ];

    function renderSummary() {
      var b = sumEffects();

      var strength   = (b.Strength && b.Strength.total) || 0;
      var fitness   = (b.Fitness  && b.Fitness.total)  || 0;
      var perception = (b.Perception && b.Perception.total) || 0;
      var maxHP = (b.MaxHP    && b.MaxHP.value)    || 0;
      var levels = currentSkillLevels();
      var names  = Object.keys(levels).sort();


      var skillRows = '';
      for (var i = 0; i < names.length; i++) {
        var nm = names[i], lv = levels[nm];
        if (lv > 0) skillRows += '<tr><td>' + nm + '</td><td><b>' + lv + '</b></td></tr>';
      }
      if (!skillRows) skillRows = '<tr><td colspan="2" class="muted">No skills selected yet.</td></tr>';

      var rollRows = '';
      for (i = 0; i < ROLL_CHECKS.length; i++) {
        var chk = ROLL_CHECKS[i];
        var tot = (b[chk] && (b[chk].total || 0)) || 0;
        if (tot !== 0) rollRows += '<tr><td>' + chk + '</td><td><b>' + (tot > 0 ? '+' : '') + tot + '</b></td></tr>';
      }
      if (!rollRows) rollRows = '<tr><td colspan="2" class="muted">No roll modifiers.</td></tr>';

      var html =
        '<div class="totals" style="margin-bottom:8px">' +
          '<span class="pill">Strength: <b>' + strength + '</b></span>' +
          '<span class="pill">Fitness: <b>' + fitness + '</b></span>' +
          '<span class="pill">Perception: <b>' + perception + '</b></span>' +
          '<span class="pill">Max HP: <b>' + maxHP + '</b></span>' +
        '</div>' +
        '<table class="stat-table"><thead><tr><th>Skills with Levels</th><th>Level</th></tr></thead><tbody>' +
          skillRows +
        '</tbody></table>' +
        '<table class="stat-table" style="margin-top:12px"><thead><tr><th>Roll Modifiers</th><th>Mod</th></tr></thead><tbody>' +
          rollRows +
        '</tbody></table>';

      $('#summary-area').html(html);
    }

    function renderRoller() {
      var preferred = ['Melee Attack','Melee Defence','Ranged Attack','Perception','Resolve','Initiative','Robustness'];
      var inPref = {};
      var i, optHtml = '';
      for (i = 0; i < preferred.length; i++) inPref[preferred[i]] = true;

      for (i = 0; i < preferred.length; i++) optHtml += '<option>' + preferred[i] + '</option>';
      for (i = 0; i < CHECKS.length; i++) if (!inPref[CHECKS[i]]) optHtml += '<option>' + CHECKS[i] + '</option>';

      var html =
        '<label>Roll Test Type</label>' +
        '<select id="rollType">' + optHtml + '</select>' +
        '<div class="rollbox">' +
          '<button id="rollBtn">Roll 2d6</button>' +
          '<div class="dice"><div class="die" id="d1">–</div><div class="die" id="d2">–</div></div>' +
          '<div>' +
            '<div class="total" id="total">Total —</div>' +
            '<div class="small" id="breakdown">Modifier breakdown will appear here.</div>' +
          '</div>' +
        '</div>';

      $('#roller-area').html(html);
      $('#rollBtn').off('click').on('click', function () {
        var name = $('#rollType').val();
        var a = 1 + Math.floor(Math.random() * 6);
        var b2 = 1 + Math.floor(Math.random() * 6);
        var bd = sumEffects();
        var row = bd[name] || { base:0, traits:0, skills:0, derived:0, total:0 };
        var mod = row.total || 0;
        $('#d1').text(a); $('#d2').text(b2);
        $('#total').text('Total ' + (a + b2 + mod) + '  (2d6=' + (a + b2) + ' ' + (mod >= 0 ? '+' : '') + mod + ')');
        $('#breakdown').html('Base: ' + (row.base||0) + ' + Traits: ' + (row.traits||0) + ' + Skills: ' + (row.skills||0) + ' + Derived: ' + (row.derived||0) + ' = <b>' + mod + '</b>');
      });
    }

    function renderAll() {
      renderBackground();
      renderTraitsAndSkills();
      renderSummary();
      renderRoller();
    }

    renderAll();
  }

  $(mount);
  mw.hook('wikipage.content').add(function () { mount(); });

})(mediaWiki, jQuery);
