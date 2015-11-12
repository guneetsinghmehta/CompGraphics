var parseFaceShadedOBJ;

parseFaceShadedOBJ = function(str) {
  var fnorms, ftxcos, fverts, hasTextures, indices, j, k, l, len, len1, len2, len3, ln, m, matches, nindices, norms, o, objarr, ref, ref1, ref2, tindices, txcos, verts;
  objarr = str.split('\n');
  verts = [];
  norms = [];
  txcos = [];
  nindices = [];
  indices = [];
  tindices = [];
  hasTextures = void 0;

  for (j = 0, len = objarr.length; j < len; j++) {
    ln = objarr[j];
    if (ln.match(/v /)) {
      ref = ln.match(/v (.*) (.*) (.*)/).slice(1);
      for (k = 0, len1 = ref.length; k < len1; k++) {
        m = ref[k];
        verts.push(Number(m));
      }
    }
    if (ln.match(/vn /)) {
      ref1 = ln.match(/vn (.*) (.*) (.*)/).slice(1);
      for (l = 0, len2 = ref1.length; l < len2; l++) {
        m = ref1[l];
        norms.push(Number(m));
      }
    }
    if (ln.match(/vt /)) {
      ref2 = ln.match(/vt (.*) (.*)/).slice(1);
      for (o = 0, len3 = ref2.length; o < len3; o++) {
        m = ref2[o];
        txcos.push(Number(m));
      }
    }
    if (ln.match(/f /)) {
      matches = ln.match(/\ (\d+)\//g);
      indices = indices.concat(matches.map(function(i) {
        return Number(i.slice(1, -1) - 1);
      }));
      matches = (ln.match(/\/(\d+)\//g)) || [];
      tindices = tindices.concat(matches.map(function(i) {
        return Number(i.slice(1, -1) - 1);
      }));
      matches = (ln.match(/\/(\d+)(\ |$)/g)) || [];
      nindices = nindices.concat(matches.map(function(i) {
        return Number(i.slice(1) - 1);
      }));
    }
  }
  fnorms = [];
  nindices.forEach(function(n) {
    return fnorms = fnorms.concat([norms[n * 3], norms[n * 3 + 1], norms[n * 3 + 2]]);
  });
  fverts = [];
  indices.forEach(function(i) {
    return fverts = fverts.concat([verts[i * 3], verts[i * 3 + 1], verts[i * 3 + 2]]);
  });
  ftxcos = [];
  tindices.forEach(function(i) {
    return ftxcos = ftxcos.concat([txcos[i * 2], txcos[i * 2 + 1]]);
  });
  return {
    verts: fverts,
    norms: fnorms,
    txtcos: ftxcos
  };
};
