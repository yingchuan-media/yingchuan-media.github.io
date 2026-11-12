(() => {
  const overlay = document.querySelector("#startup");
  const canvas = overlay.querySelector("canvas");
  const context = canvas.getContext("2d");
  const shell = document.querySelector("#website-shell");
  const skip = overlay.querySelector("button");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const timing = window.yingchuanStartupTiming;
  if (!context || !timing) return;
  const TAU = Math.PI * 2;
  const colors = {
    highlight: "#42C7B4",
    teal: "#17A99B",
    ink: "#11262B",
    background: "#0E1F24",
    border: "#1E3D45",
    white: "#F0F6F3",
  };
  const clamp = (value) => Math.max(0, Math.min(1, value));
  const phase = (value, from, to) => clamp((value - from) / (to - from));
  const mix = (a, b, t) => a + (b - a) * t;
  const lerp = (a, b, t) => [mix(a[0], b[0], t), mix(a[1], b[1], t)];
  const cubic = (value, x1, y1, x2, y2) => {
    if (value === 0 || value === 1) return value;
    let low = 0,
      high = 1,
      t = value;
    for (let i = 0; i < 12; i++) {
      const x =
        3 * (1 - t) * (1 - t) * t * x1 + 3 * (1 - t) * t * t * x2 + t * t * t;
      if (x < value) low = t;
      else high = t;
      t = (low + high) / 2;
    }
    return (
      3 * (1 - t) * (1 - t) * t * y1 + 3 * (1 - t) * t * t * y2 + t * t * t
    );
  };
  const ease = (value) => cubic(value, 0.645, 0.045, 0.355, 1);
  const rgba = (hex, alpha) =>
    `${hex}${Math.round(clamp(alpha) * 255)
      .toString(16)
      .padStart(2, "0")}`;
  const mixColor = (a, b, amount) =>
    "#" +
    [1, 3, 5]
      .map((index) =>
        Math.round(
          mix(
            parseInt(a.slice(index, index + 2), 16),
            parseInt(b.slice(index, index + 2), 16),
            amount,
          ),
        )
          .toString(16)
          .padStart(2, "0"),
      )
      .join("");
  const commands = [
    [
      ["M", 30, 18],
      ["L", 40, 18],
      ["Q", 42.6, 18, 43.1, 20.6],
      ["C", 48.7, 51.3, 43.6, 86.5, 27.2, 110.5],
      ["Q", 26.1, 112, 24.3, 112],
      ["L", 13.8, 112],
      ["Q", 10.6, 112, 12.4, 109.1],
      ["C", 29, 84.8, 34.2, 51.2, 27.4, 21.7],
      ["Q", 26.6, 18, 30, 18],
      ["Z"],
    ],
    [
      ["M", 60, 25],
      ["L", 70, 25],
      ["Q", 73, 25, 73, 28],
      ["C", 73, 52, 73, 78, 73, 102],
      ["Q", 73, 105, 70, 105],
      ["L", 60, 105],
      ["Q", 57, 105, 57, 102],
      ["C", 57, 78, 57, 52, 57, 28],
      ["Q", 57, 25, 60, 25],
      ["Z"],
    ],
    [
      ["M", 95, 21.5],
      ["Q", 95, 18.8, 97.6, 18.2],
      ["L", 107.6, 16],
      ["Q", 111, 15.2, 111, 18.8],
      ["L", 111, 109],
      ["Q", 111, 112, 108, 112],
      ["L", 98, 112],
      ["Q", 95, 112, 95, 109],
      ["Z"],
    ],
  ];
  function markPath(index, formation = 1) {
    const center = [30, 65, 103][index];
    const amount =
      formation === 1
        ? 1
        : ease(clamp((formation - index * 0.045) / (1 - index * 0.045)));
    return commands[index]
      .map(([command, ...values]) => {
        const points = [];
        for (let i = 0; i < values.length; i += 2) {
          const x = values[i],
            y = values[i + 1];
          const wave = Math.sin(((y - 16) / 96) * Math.PI * 1.8 + index * 0.8);
          points.push(
            65 +
              (center - 65) * (0.34 + 0.66 * amount) +
              (x - center) * (0.6 + 0.4 * amount) +
              wave * 22 * (1 - amount),
            64 +
              (y - 64) * (0.24 + 0.76 * amount) +
              (index - 1) * 10 * (1 - amount),
          );
        }
        return command + points.join(" ");
      })
      .join(" ");
  }
  const svgPath = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path",
  );
  function sample(path) {
    svgPath.setAttribute("d", path);
    const length = svgPath.getTotalLength();
    return Array.from({ length: 96 }, (_, index) => {
      const p = svgPath.getPointAtLength((length * index) / 96);
      return [p.x, p.y];
    });
  }
  const roundedRect = (x, y, w, h, r) =>
    `M${x + w / 2} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + h}H${x + r}A${r} ${r} 0 0 1 ${x} ${y + h - r}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`;
  const shellPoints = sample(roundedRect(0, 0, 128, 128, 29));
  const borderPoints = sample(roundedRect(1, 1, 126, 126, 28));
  const slot = sample(roundedRect(-2, -14, 4, 28, 2));
  const strokes = commands.map((_, index) =>
    sample(markPath(index)).map(([x, y]) => [
      23 + ((x - 2) * 84) / 128,
      19 + (y * 84) / 128,
    ]),
  );
  const circle = Array.from({ length: 96 }, (_, i) => [
    Math.cos((i / 96) * TAU - Math.PI / 2),
    Math.sin((i / 96) * TAU - Math.PI / 2),
  ]);
  function polygon(points) {
    const path = new Path2D();
    points.forEach((p, i) => (i ? path.lineTo(...p) : path.moveTo(...p)));
    path.closePath();
    return path;
  }
  function hull(points) {
    const sorted = points.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const turn = (a, b, c) =>
      (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
    const half = (list) => {
      const result = [];
      for (const point of list) {
        while (
          result.length >= 2 &&
          turn(result.at(-2), result.at(-1), point) <= 0
        )
          result.pop();
        result.push(point);
      }
      return result.slice(0, -1);
    };
    return [...half(sorted), ...half(sorted.slice().reverse())];
  }
  function roundedHull(points) {
    let first = 0;
    points.forEach((p, i) => {
      if (p[1] < points[first][1]) first = i;
    });
    let path = "";
    for (let step = 0; step < points.length; step++) {
      const index = (first + step) % points.length;
      const corner = points[index],
        before = points[(index + points.length - 1) % points.length],
        after = points[(index + 1) % points.length];
      const a = Math.hypot(before[0] - corner[0], before[1] - corner[1]),
        b = Math.hypot(after[0] - corner[0], after[1] - corner[1]);
      const distance = Math.min(3, Math.min(a, b) * 0.24);
      const entry = lerp(corner, before, distance / a),
        exit = lerp(corner, after, distance / b);
      path += `${step ? "L" : "M"}${entry.join(" ")}Q${corner.join(" ")} ${exit.join(" ")}`;
    }
    return path + "Z";
  }
  const interpolate = (source, target, p) =>
    polygon(source.map((point, i) => lerp(point, target[i], p)));
  function badge(ctx, x, y, extent, formation) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(extent / 128, extent / 128);
    ctx.fillStyle = colors.background;
    ctx.fill(new Path2D(roundedRect(0, 0, 128, 128, 29)));
    ctx.strokeStyle = colors.border;
    ctx.lineWidth = 1.5;
    ctx.stroke(new Path2D(roundedRect(1, 1, 126, 126, 28)));
    ctx.translate(23, 19);
    ctx.scale(84 / 128, 84 / 128);
    ctx.translate(-2, 0);
    commands.forEach((_, index) => {
      ctx.fillStyle = index ? colors.teal : colors.highlight;
      ctx.fill(new Path2D(markPath(index, formation)));
    });
    ctx.restore();
  }
  function camera(progress, width, height) {
    const e = (a, b) => ease(phase(progress, a, b));
    const tilt = e(0, 0.08),
      morph = e(0.08, 0.26),
      positioning = e(0.26, 0.46),
      power = e(0.46, 0.51),
      beam = e(0.51, 0.59),
      exposure = e(0.59, 0.65),
      orbit = e(0.65, 0.79),
      expansion = e(0.79, 1),
      opacity = 1 - e(0.69, 0.72);
    const yaw = 1.05 * (1 - orbit),
      pitch = 0.16 * (1 - orbit),
      targetDepth = 55 * (1 - orbit),
      zoom = 0.86 + 0.14 * orbit;
    const project = ([px, py], depth = 0) => {
      const z = depth - targetDepth;
      return [
        170 + zoom * (px * Math.cos(yaw) + z * Math.sin(yaw)),
        149 +
          21 * orbit +
          zoom *
            (py * Math.cos(pitch) +
              (z * Math.cos(yaw) - px * Math.sin(yaw)) * Math.sin(pitch)),
      ];
    };
    const anchor = lerp([170, 155], project([190, 0], 95), positioning),
      extent = mix(150, zoom * 74, positioning);
    const origin = project([0, 0]);
    const direction = (x, y, z) => {
      const point = project([x, y], z);
      return [(point[0] - origin[0]) / zoom, (point[1] - origin[1]) / zoom];
    };
    const length = Math.hypot(190, 95);
    const view = {
      face: direction(-95 / length, 0, 190 / length),
      body: direction(190 / length, 0, 95 / length),
      vertical: direction(0, 1, 0),
    };
    const screenScale = Math.min(236 / width, 160 / height),
      sw = width * screenScale,
      sh = height * screenScale;
    const corners = [
      [-sw / 2, -sh / 2],
      [sw / 2, -sh / 2],
      [sw / 2, sh / 2],
      [-sw / 2, sh / 2],
    ];
    const pivot = lerp([64, 64], [28, 70], morph),
      angle = -0.24 * tilt * (1 - morph),
      a = 1 - 0.16 * tilt * (1 - morph),
      b = -0.1 * tilt * (1 - morph),
      scale = extent / 128;
    const transform = [
      scale * (Math.cos(angle) * a - Math.sin(angle) * b),
      scale * (Math.sin(angle) * a + Math.cos(angle) * b),
      -scale * Math.sin(angle),
      scale * Math.cos(angle),
      0,
      0,
    ];
    transform[4] =
      anchor[0] - transform[0] * pivot[0] - transform[2] * pivot[1];
    transform[5] =
      anchor[1] - transform[1] * pivot[0] - transform[3] * pivot[1];
    const lens = [
      transform[0] * 28 + transform[2] * 70 + transform[4],
      transform[1] * 28 + transform[3] * 70 + transform[5],
    ];
    return {
      progress,
      tilt,
      morph,
      power,
      beam,
      exposure,
      expansion,
      opacity,
      anchor,
      extent,
      view,
      corners,
      project,
      transform,
      lens,
      sw,
      sh,
      light: beam * opacity,
      ray: (target, t) => project(lerp([190, 0], target, t), 95 * (1 - t)),
    };
  }
  function projector(ctx, c, formation) {
    ctx.save();
    ctx.transform(...c.transform);
    if (c.morph === 0) {
      badge(ctx, 0, 0, 128, formation);
      ctx.restore();
      return;
    }
    const point = (u, v, depth) => [
      28 + c.view.face[0] * u + c.view.vertical[0] * v + c.view.body[0] * depth,
      70 + c.view.face[1] * u + c.view.vertical[1] * v + c.view.body[1] * depth,
    ];
    const lens = circle.map(([x, y]) => point(x * 19, y * 19, 0));
    const box = [];
    for (const depth of [10, 94])
      for (const u of [-25, 25])
        for (const v of [-24, 24]) box.push(point(u, v, depth));
    const body = sample(roundedHull(hull([...box, ...lens])));
    const shape = interpolate(shellPoints, body, c.morph);
    ctx.fillStyle = colors.background;
    ctx.fill(shape);
    const detail = ease(c.morph);
    ctx.save();
    ctx.globalAlpha *= detail;
    ctx.save();
    ctx.clip(shape);
    const plane = (origin, x, y, draw) => {
      ctx.save();
      ctx.transform(x[0], x[1], y[0], y[1], ...origin);
      draw();
      ctx.restore();
    };
    const face = (rect, from, to, vertical = false) => {
      const [x, y, w, h, r] = rect;
      const gradient = ctx.createLinearGradient(
        x,
        y,
        vertical ? x : x + w,
        vertical ? y + h : y,
      );
      gradient.addColorStop(0, from);
      gradient.addColorStop(1, to);
      ctx.fillStyle = gradient;
      ctx.fill(new Path2D(roundedRect(x, y, w, h, r)));
    };
    plane(point(0, -24, 0), c.view.face, c.view.body, () =>
      face([-25, 10, 50, 84, 3], colors.border, colors.ink),
    );
    plane(point(25, 0, 0), c.view.body, c.view.vertical, () => {
      face([10, -24, 84, 48, 4], colors.border, colors.background, true);
      ctx.fillStyle = colors.border;
      for (const depth of [26, 76])
        ctx.fill(new Path2D(roundedRect(depth, 24, 12, 5, 2)));
      ctx.fillStyle = colors.highlight;
      ctx.beginPath();
      ctx.arc(82, -15, 2, 0, TAU);
      ctx.fill();
    });
    plane(point(0, 0, 10), c.view.face, c.view.vertical, () =>
      face([-25, -24, 50, 48, 5], colors.ink, colors.background, true),
    );
    ctx.restore();
    ctx.fillStyle = colors.border;
    ctx.fill(
      polygon(
        hull([...lens, ...circle.map(([x, y]) => point(x * 19, y * 19, 10))]),
      ),
    );
    ctx.restore();
    const center = body.reduce(
      (sum, p) => [sum[0] + p[0] / 96, sum[1] + p[1] / 96],
      [0, 0],
    );
    ctx.strokeStyle = mixColor(colors.border, colors.teal, 0.4 * c.morph);
    ctx.lineWidth = 1.5;
    ctx.stroke(
      interpolate(
        borderPoints,
        body.map((p) => lerp(p, center, 0.012)),
        c.morph,
      ),
    );
    strokes.forEach((stroke, index) => {
      const target = index
        ? slot.map(([x, y]) => point(25, y, (index === 1 ? 50 : 65) + x))
        : lens;
      ctx.fillStyle = index ? colors.teal : colors.highlight;
      ctx.fill(interpolate(stroke, target, c.morph));
    });
    const glass = ease(phase(c.morph, 0.35, 1));
    if (glass > 0) {
      plane([28, 70], c.view.face, c.view.vertical, () => {
        const radius = 13 * glass;
        ctx.fillStyle = colors.background;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, TAU);
        ctx.fill();
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
        gradient.addColorStop(0, mixColor(colors.ink, colors.white, c.power));
        gradient.addColorStop(0.5, rgba(colors.teal, 0.2 + 0.6 * c.power));
        gradient.addColorStop(1, colors.background);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, Math.max(0.01, radius - 2 * glass), 0, TAU);
        ctx.fill();
        ctx.strokeStyle = rgba(colors.white, 0.65 * glass);
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(0, 0, radius - glass, 3.6, 5.1);
        ctx.stroke();
        if (c.power > 0) {
          ctx.shadowColor = rgba(colors.highlight, 0.65 * c.power);
          ctx.shadowBlur = 14;
          ctx.fillStyle = rgba(colors.highlight, 0.25 * c.power);
          ctx.beginPath();
          ctx.arc(0, 0, 18, 0, TAU);
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.fillStyle = rgba(colors.white, c.power);
          ctx.beginPath();
          ctx.arc(0, 0, 5, 0, TAU);
          ctx.fill();
        }
      });
    }
    ctx.restore();
  }
  function gather(ctx, time) {
    if (time <= 0 || time >= 0.4) return;
    const fade = 1 - cubic(phase(time, 0.28, 0.4), 0.55, 0.055, 0.675, 0.19),
      pooled = Math.sin(Math.PI * phase(time, 0.13, 0.4));
    const glow = ctx.createRadialGradient(170, 155, 0, 170, 155, 45);
    glow.addColorStop(0, rgba(colors.highlight, 0.42 * pooled));
    glow.addColorStop(0.5, rgba(colors.teal, 0.1 * pooled));
    glow.addColorStop(1, rgba(colors.teal, 0));
    ctx.fillStyle = glow;
    ctx.fillRect(125, 110, 90, 90);
    for (let index = 0; index < 36; index++) {
      const angle = index * 2.399963,
        radius = 126 + (index % 6) * 11;
      const start = [
          170 + Math.cos(angle) * radius,
          155 + Math.sin(angle) * radius,
        ],
        landing = [
          170 + Math.cos(angle * 1.7) * (3 + (index % 5) * 1.8),
          155 + Math.sin(angle * 1.3) * (3 + (index % 5) * 1.8),
        ];
      const control = [
        170 +
          (start[0] - 170) * 0.32 -
          Math.sin(angle) * (38 + (index % 4) * 7),
        155 +
          (start[1] - 155) * 0.32 +
          Math.cos(angle) * (38 + (index % 4) * 7),
      ];
      const progress = phase(
        time,
        (index % 6) * 0.012,
        0.2 + (index % 7) * 0.012,
      );
      if (progress === 0) continue;
      const travel = ease(progress),
        point = (t) => [
          (1 - t) ** 2 * start[0] +
            2 * (1 - t) * t * control[0] +
            t * t * landing[0],
          (1 - t) ** 2 * start[1] +
            2 * (1 - t) * t * control[1] +
            t * t * landing[1],
        ];
      const brightness = fade * cubic(phase(progress, 0, 0.12), 0, 0, 0.58, 1),
        head = point(travel),
        color = index % 3 ? colors.teal : colors.highlight;
      ctx.beginPath();
      ctx.moveTo(...head);
      for (let s = 1; s <= 6; s++)
        ctx.lineTo(...point(clamp(travel - s * 0.015 * (1 - progress))));
      ctx.lineCap = "round";
      ctx.strokeStyle = rgba(color, 0.85 * brightness);
      ctx.lineWidth = 1.1 + (index % 3) * 0.3;
      ctx.shadowColor = rgba(color, 0.3 * brightness);
      ctx.shadowBlur = 6;
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.fillStyle = rgba(colors.white, 0.9 * brightness);
      ctx.beginPath();
      ctx.arc(...head, 1.2 + (index % 4) * 0.35, 0, TAU);
      ctx.fill();
    }
  }
  function beam(ctx, c) {
    if (c.light <= 0) return;
    const surface = c.corners.map((p) => c.project(p)),
      reached = c.corners.map((p) => c.ray(p, c.beam));
    ctx.save();
    const clip = new Path2D();
    clip.rect(0, 0, 340, 340);
    const surfacePath = polygon(surface);
    clip.addPath(surfacePath);
    ctx.clip(clip, "evenodd");
    const points = hull([c.lens, ...reached]);
    const left = Math.min(...points.map((p) => p[0])),
      right = Math.max(...points.map((p) => p[0]));
    const gradient = ctx.createLinearGradient(right, 0, left, 0);
    gradient.addColorStop(0, rgba(colors.highlight, 0.22 * c.light));
    gradient.addColorStop(1, rgba(colors.teal, 0.025 * c.light));
    ctx.fillStyle = gradient;
    ctx.fill(polygon(points));
    for (let ray = 0; ray < 20; ray++) {
      const edge = Math.floor(ray / 5),
        target = lerp(
          c.corners[edge],
          c.corners[(edge + 1) % 4],
          (ray % 5) / 5,
        ),
        reach = c.ray(target, c.beam),
        pulse = 0.5 + 0.5 * Math.sin(ray * 2.4 + c.progress * 35);
      ctx.strokeStyle = rgba(colors.highlight, (0.09 + 0.1 * pulse) * c.light);
      ctx.lineWidth = 0.55;
      ctx.beginPath();
      ctx.moveTo(...c.lens);
      ctx.lineTo(...reach);
      ctx.stroke();
      ctx.fillStyle = rgba(colors.white, 0.35 * c.light * pulse);
      ctx.beginPath();
      ctx.arc(
        ...c.ray(target, ((c.progress * 2.8 + ray * 0.173) % 1) * c.beam),
        0.55,
        0,
        TAU,
      );
      ctx.fill();
    }
    ctx.restore();
  }
  let active = false,
    frame = 0,
    start = 0,
    paused = 0,
    width = 0,
    height = 0,
    previousFocus = null;
  const saved = {};
  function dimensions() {
    width = innerWidth;
    height = innerHeight;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function render(elapsed) {
    const intro = clamp(elapsed / timing.reveal),
      homeTime = elapsed - timing.reveal * 0.45;
    const home =
      homeTime <= 0
        ? 0
        : homeTime < timing.projection
          ? (0.79 * homeTime) / timing.projection
          : 0.79 +
            0.21 * clamp((homeTime - timing.projection) / timing.expansion);
    const c = camera(home, width, height),
      stage = Math.min(340, width, height),
      scale = stage / 340,
      ox = (width - stage) / 2,
      oy = (height - stage) / 2;
    context.clearRect(0, 0, width, height);
    context.save();
    context.translate(ox, oy);
    context.scale(scale, scale);
    context.beginPath();
    context.rect(0, 0, 340, 340);
    context.clip();
    const presence = ease(phase(intro, 0.28, 0.45)),
      formation = phase(intro, 0.28, 0.45),
      ignition = Math.sin(Math.PI * phase(intro, 0.36, 0.45));
    const opacity = presence * c.opacity;
    if (opacity > 0) {
      const glow = context.createRadialGradient(
        ...c.anchor,
        0,
        ...c.anchor,
        142,
      );
      glow.addColorStop(
        0,
        rgba(colors.teal, (0.08 + 0.13 * ignition) * opacity),
      );
      glow.addColorStop(1, rgba(colors.teal, 0));
      context.fillStyle = glow;
      context.fillRect(c.anchor[0] - 142, c.anchor[1] - 142, 284, 284);
    }
    gather(context, intro);
    beam(context, c);
    if (opacity > 0) {
      context.save();
      context.globalAlpha = opacity;
      context.save();
      const shadow = lerp(
        [c.anchor[0], c.anchor[1] + c.extent / 2 + 10],
        [c.anchor[0] + c.extent * 0.38, c.anchor[1] + c.extent * 0.32],
        c.morph,
      );
      context.fillStyle = "#00000080";
      context.shadowColor = "#00000080";
      context.shadowBlur = 16;
      context.beginPath();
      context.ellipse(...shadow, c.extent * 0.55, 4.5, 0, 0, TAU);
      context.fill();
      context.restore();
      projector(context, c, formation);
      if (ignition > 0 && c.tilt === 0) {
        context.save();
        context.shadowBlur = 4;
        context.shadowColor = rgba(colors.highlight, ignition * 0.85);
        context.strokeStyle = rgba(colors.highlight, ignition * 0.85);
        context.lineWidth = 1.5 + 1.5 * ignition;
        context.stroke(
          new Path2D(
            roundedRect(
              c.anchor[0] - c.extent / 2 + 1,
              c.anchor[1] - c.extent / 2 + 1,
              c.extent - 2,
              c.extent - 2,
              (c.extent * 29) / 128,
            ),
          ),
        );
        const left = c.anchor[0] - c.extent / 2;
        const top = c.anchor[1] - c.extent / 2;
        const sweep = top + c.extent * phase(intro, 0.36, 0.45);
        context.shadowBlur = 0;
        context.clip(
          new Path2D(
            roundedRect(left, top, c.extent, c.extent, (c.extent * 29) / 128),
          ),
        );
        const sweepGradient = context.createLinearGradient(
          0,
          sweep - 14,
          0,
          sweep + 14,
        );
        sweepGradient.addColorStop(0, rgba(colors.white, 0));
        sweepGradient.addColorStop(0.5, rgba(colors.white, ignition * 0.22));
        sweepGradient.addColorStop(1, rgba(colors.white, 0));
        context.fillStyle = sweepGradient;
        context.fillRect(left, sweep - 14, c.extent, 28);
        context.restore();
      }
      if (c.tilt < 1) {
        context.save();
        context.globalAlpha *= 0.09 * presence * (1 - c.tilt);
        context.translate(
          c.anchor[0] - c.extent / 2,
          c.anchor[1] + c.extent / 2 + 8,
        );
        context.scale(1, -0.28);
        badge(context, 0, -c.extent, c.extent, formation);
        context.restore();
      }
      context.restore();
    }
    context.restore();
    const origin = c.project([-c.sw / 2, -c.sh / 2]),
      horizontal = c.project([1, 0]),
      base = c.project([0, 0]),
      vertical = c.project([0, 1]);
    const matrix = [
      (scale * (horizontal[0] - base[0]) * c.sw) / width,
      (scale * (horizontal[1] - base[1]) * c.sw) / width,
      (scale * (vertical[0] - base[0]) * c.sh) / height,
      (scale * (vertical[1] - base[1]) * c.sh) / height,
      ox + scale * origin[0],
      oy + scale * origin[1],
    ];
    const identity = [1, 0, 0, 1, 0, 0];
    shell.style.transform = `matrix(${matrix.map((v, i) => mix(v, identity[i], c.expansion)).join(",")})`;
    shell.style.opacity = c.exposure;
  }
  function finish() {
    if (!active) return;
    active = false;
    cancelAnimationFrame(frame);
    overlay.hidden = true;
    shell.inert = false;
    for (const property of [
      "transform",
      "opacity",
      "transform-origin",
      "height",
      "overflow",
      "will-change",
    ])
      shell.style.removeProperty(property);
    document.body.style.overflow = saved.overflow;
    document.documentElement.classList.remove("startup-active");
    if (previousFocus instanceof HTMLElement && previousFocus !== document.body)
      previousFocus.focus({ preventScroll: true });
    dispatchEvent(new Event("resize"));
  }
  function tick(now) {
    if (!active || document.hidden) return;
    const elapsed = now - start;
    if (
      elapsed >=
      timing.reveal * 0.45 + timing.projection + timing.expansion
    ) {
      finish();
      return;
    }
    try {
      render(elapsed);
      frame = requestAnimationFrame(tick);
    } catch {
      finish();
    }
  }
  function play() {
    if (active || reduced.matches) return;
    previousFocus = document.activeElement;
    saved.overflow = document.body.style.overflow;
    active = true;
    overlay.hidden = false;
    shell.inert = true;
    document.documentElement.classList.add("startup-active");
    document.body.style.overflow = "hidden";
    shell.style.transformOrigin = "0 0";
    shell.style.height = `${innerHeight}px`;
    shell.style.overflow = "hidden";
    shell.style.willChange = "transform, opacity";
    dimensions();
    render(0);
    skip.focus({ preventScroll: true });
    start = performance.now();
    frame = requestAnimationFrame(tick);
  }
  skip.addEventListener("click", finish);
  overlay.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      finish();
    } else if (event.key === "Tab") {
      event.preventDefault();
      skip.focus();
    }
  });
  const replayButtons = [...document.querySelectorAll("[data-replay-startup]")];
  replayButtons.forEach((button) => button.addEventListener("click", play));
  function updateMotionPreference() {
    if (reduced.matches) finish();
    replayButtons.forEach((button) => {
      button.disabled = reduced.matches;
      button.title = reduced.matches
        ? "系统已启用减少动态效果"
        : "重播客户端开屏动画";
    });
  }
  reduced.addEventListener("change", updateMotionPreference);
  updateMotionPreference();
  addEventListener("resize", () => {
    if (active) {
      dimensions();
      shell.style.height = `${innerHeight}px`;
    }
  });
  document.addEventListener("visibilitychange", () => {
    if (!active) return;
    if (document.hidden) {
      paused = performance.now();
      cancelAnimationFrame(frame);
    } else {
      start += performance.now() - paused;
      frame = requestAnimationFrame(tick);
    }
  });
  let seen = false;
  try {
    seen = sessionStorage.getItem("yingchuan-opening") === "seen";
    sessionStorage.setItem("yingchuan-opening", "seen");
  } catch {}
  if (!seen && !location.hash) {
    if (document.hidden) {
      document.addEventListener("visibilitychange", function waitVisible() {
        if (!document.hidden) {
          document.removeEventListener("visibilitychange", waitVisible);
          play();
        }
      });
    } else play();
  }
})();
