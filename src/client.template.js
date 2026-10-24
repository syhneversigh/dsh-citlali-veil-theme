(function () {
  "use strict";

  const SOURCE = "dsh-citlali-veil-theme";
  const STORAGE_KEY = "dsh-citlali-veil-theme/settings/v1";
  const LIGHT = __LIGHT__;
  const DARK = __DARK__;
  const TOKENS = Object.fromEntries(Object.keys(LIGHT).map((name) => [name, {
    light: LIGHT[name],
    dark: DARK[name],
  }]));
  const CSS = __CSS__;
  const NIGHT = __CITLALI_NIGHT__;
  const STANDING = __CITLALI_STANDING__;
  const PORTRAIT = __CITLALI_PORTRAIT__;
  const MARK = __CITLALI_MARK__;

  window.__ModuleLoader__.load({
    id: SOURCE,
    factory: function (require) {
      const React = require("react");
      const ReactDOM = require("react-dom");
      const h = React.createElement;

      function loadSettings() {
        const defaults = { enabled: true, artwork: true, dim: 40 };
        try {
          const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
          return {
            enabled: typeof saved?.enabled === "boolean" ? saved.enabled : defaults.enabled,
            artwork: typeof saved?.artwork === "boolean" ? saved.artwork : defaults.artwork,
            dim: Number.isFinite(saved?.dim) ? Math.max(0, Math.min(80, Math.round(saved.dim))) : defaults.dim,
          };
        } catch {
          return defaults;
        }
      }

      function Switch({ checked, label, description, onChange, disabled }) {
        return h("button", {
          type: "button",
          role: "switch",
          "aria-checked": checked,
          "aria-label": label,
          "data-citlali-veil-setting-row": true,
          disabled,
          onClick: () => onChange(!checked),
        },
          h("span", { "data-citlali-veil-setting-text": true },
            h("span", { "data-citlali-veil-setting-label": true }, label),
            h("span", { "data-citlali-veil-setting-description": true }, description),
          ),
          h("span", { "data-citlali-veil-switch": true, "data-on": String(checked), "aria-hidden": "true" }),
        );
      }

      function SettingsCard({ context, getSettings, updateSettings }) {
        const [settings, setSettings] = React.useState(getSettings);
        const [preference, setPreference] = React.useState(() => context.theme.getTheme().preference);
        React.useEffect(() => context.on("theme/change", (snapshot) => {
          setPreference(snapshot.preference);
        }), []);
        const update = (patch, options) => {
          updateSettings(patch, options);
          setSettings(getSettings());
        };
        const previewDim = (event) => update({ dim: Number(event.target.value) }, { sync: false, persist: false });
        const persistDim = (event) => update({ dim: Number(event.target.value) }, { sync: false, persist: true });
        return h("section", { "data-citlali-veil-settings": true, "aria-label": "茜特菈莉 · 星帷漫游" },
          h("header", { "data-citlali-veil-settings-header": true },
            h("div", { "data-citlali-veil-settings-portrait": true },
              h("img", { src: PORTRAIT, alt: "《原神》茜特菈莉新衣装" }),
            ),
            h("div", { "data-citlali-veil-settings-heading": true },
              h("span", null, "CITLALI · THROUGH THE VEIL"),
              h("strong", null, "茜特菈莉 · 星帷漫游"),
              h("p", null, "让新衣装的星光与轻纱铺满整个工作区。"),
            ),
          ),
          h(Switch, {
            checked: settings.enabled,
            label: "启用「星帷漫游」皮肤",
            description: "开启或恢复 DSH 官方外观，不改变其他设置",
            onChange: (enabled) => update({ enabled }),
          }),
          h(Switch, {
            checked: settings.artwork,
            label: "全页插画与无边框角色",
            description: "显示卧室背景、星夜装饰与欢迎页立绘",
            disabled: !settings.enabled,
            onChange: (artwork) => update({ artwork }),
          }),
          h("div", { "data-citlali-veil-setting-row": true, "data-citlali-veil-dim-row": true },
            h("label", { "data-citlali-veil-setting-text": true, htmlFor: "citlali-veil-dim" },
              h("span", { "data-citlali-veil-setting-label": true }, "背景淡化"),
              h("span", { "data-citlali-veil-setting-description": true }, "淡化只作用于美术层，文字与面板保持清晰"),
            ),
            h("div", { "data-citlali-veil-dim-control": true },
              h("input", {
                id: "citlali-veil-dim",
                "data-citlali-veil-dim-slider": true,
                type: "range",
                min: 0,
                max: 80,
                step: 5,
                value: settings.dim,
                disabled: !settings.enabled || !settings.artwork,
                "aria-label": "背景淡化程度",
                onInput: previewDim,
                onPointerUp: persistDim,
                onKeyUp: persistDim,
                onBlur: persistDim,
              }),
              h("output", { "data-citlali-veil-dim-value": true, htmlFor: "citlali-veil-dim" }, `${settings.dim}%`),
            ),
          ),
          h("div", { "data-citlali-veil-setting-row": true },
            h("span", { "data-citlali-veil-setting-text": true },
              h("span", { "data-citlali-veil-setting-label": true }, "界面明暗"),
              h("span", { "data-citlali-veil-setting-description": true }, "星雾般的浅色，或烟帷中的夜色"),
            ),
            h("div", { "data-citlali-veil-theme-options": true, role: "group", "aria-label": "星帷漫游界面明暗" },
              [
                { id: "system", label: "跟随系统" },
                { id: "light", label: "星雾 · 浅色" },
                { id: "dark", label: "夜帷 · 深色" },
              ].map(({ id, label }) => h("button", {
                key: id,
                type: "button",
                "data-citlali-veil-theme-choice": id,
                "aria-pressed": preference === id,
                onClick: () => context.theme.setTheme(id),
              }, label)),
            ),
          ),
          h("p", { "data-citlali-veil-settings-footer": true },
            "非官方个人主题 · 新衣装素材来自 ",
            h("a", {
              href: "https://ys.mihoyo.com/main/news/detail/164913",
              target: "_blank",
              rel: "noreferrer",
            }, "《原神》官方衣装展示"),
            "，角色与素材版权归原作者及米哈游所有。",
          ),
        );
      }

      function Star({ className }) {
        return h("svg", {
          "data-citlali-veil-star": true,
          className,
          viewBox: "0 0 32 32",
          fill: "none",
          "aria-hidden": "true",
        }, h("path", {
          d: "M16 2c1.5 8.5 5.5 12.5 14 14-8.5 1.5-12.5 5.5-14 14-1.5-8.5-5.5-12.5-14-14C10.5 14.5 14.5 10.5 16 2Z",
          fill: "currentColor",
        }));
      }

      function Scene() {
        return h("aside", {
          "data-citlali-veil-scene": true,
          role: "img",
          "aria-label": "茜特菈莉新衣装透明立绘，身边环绕轻纱、星轨与星芒",
        },
          h("div", { "aria-hidden": "true" },
            h("svg", { "data-citlali-veil-orbits": true, viewBox: "0 0 360 620", fill: "none" },
              h("ellipse", { cx: "180", cy: "300", rx: "148", ry: "258", stroke: "currentColor", strokeWidth: ".75" }),
              h("ellipse", { cx: "180", cy: "300", rx: "128", ry: "270", transform: "rotate(23 180 300)", stroke: "currentColor", strokeWidth: ".55" }),
              h("path", { d: "M-30 430C80 350 110 530 220 445s150-60 190-130", stroke: "currentColor", strokeWidth: "1.1" }),
              h("path", { d: "M-30 455C80 375 110 555 220 470s150-60 190-130", stroke: "currentColor", strokeWidth: ".55" }),
            ),
            h(Star),
            h("img", { "data-citlali-veil-standing": true, src: STANDING, alt: "", draggable: false }),
            h("span", { "data-citlali-veil-scene-signature": true }, "NIGHT WHISPERS · NATLAN"),
          ),
        );
      }

      function CitlaliHero() {
        const target = document.querySelector('[data-conversation-content][data-content-phase="hero"]') || document.body;
        return h(React.Fragment, null,
          h("span", { "data-citlali-veil-hero": true },
            h("img", { src: MARK, alt: "", width: 48, height: 48, draggable: false }),
            h("span", { "data-citlali-veil-hero-copy": true },
              h("strong", null, "星与烟帷的夜语"),
              h("small", null, "今夜的星光，会听见你的愿望。"),
            ),
          ),
          ReactDOM.createPortal(h(Scene), target),
        );
      }

      function createBackground() {
        const layer = document.createElement("div");
        layer.dataset.citlaliVeilBackground = "";
        layer.setAttribute("aria-hidden", "true");
        const drift = document.createElement("div");
        drift.dataset.citlaliVeilDrift = "";
        const image = document.createElement("img");
        image.src = NIGHT;
        image.alt = "";
        image.draggable = false;
        drift.append(image);
        const veil = document.createElement("div");
        veil.dataset.citlaliVeilScreen = "";
        const stars = document.createElement("div");
        stars.dataset.citlaliVeilStars = "";
        for (let index = 0; index < 12; index += 1) {
          const star = document.createElement("i");
          star.style.setProperty("--delay", `${-index * 1.7}s`);
          star.style.setProperty("--duration", `${5 + (index % 4) * 1.3}s`);
          stars.append(star);
        }
        layer.append(drift, veil, stars);
        return layer;
      }

      function apply(ctx) {
        let settings = loadSettings();
        let releasePalette = () => {};
        let releaseArtwork = () => {};
        const applyDim = () => {
          document.body.style.setProperty("--citlali-veil-dim", String(settings.dim / 100));
        };
        const saveSettings = () => {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
          } catch {}
        };
        const sync = () => {
          document.body.toggleAttribute("data-citlali-veil-theme", settings.enabled);
          document.body.toggleAttribute("data-citlali-veil-artwork", settings.enabled && settings.artwork);
          applyDim();
          releasePalette();
          releasePalette = settings.enabled ? ctx.theme.overrideTokens(SOURCE, TOKENS) : () => {};
          releaseArtwork();
          releaseArtwork = settings.enabled && settings.artwork
            ? ctx.slots.inject("conversation.hero.brand.mark", () => {
              try {
                return ctx.slots.register({
                  name: "conversation.hero.brand.mark",
                  priority: 60,
                }, CitlaliHero);
              } catch {
                return () => {};
              }
            })
            : () => {};
        };
        const updateSettings = (patch, { sync: resync = true, persist = true } = {}) => {
          settings = { ...settings, ...patch };
          applyDim();
          if (persist) saveSettings();
          if (resync) sync();
        };

        ctx.effect(() => {
          const style = document.createElement("style");
          style.dataset.plugin = SOURCE;
          style.textContent = CSS;
          const background = createBackground();
          document.head.append(style);
          document.body.prepend(background);
          const syncVisibility = () => document.body.toggleAttribute("data-citlali-veil-hidden", document.hidden);
          document.addEventListener("visibilitychange", syncVisibility);
          syncVisibility();
          sync();
          return () => {
            document.removeEventListener("visibilitychange", syncVisibility);
            releasePalette();
            releaseArtwork();
            document.body.removeAttribute("data-citlali-veil-theme");
            document.body.removeAttribute("data-citlali-veil-artwork");
            document.body.removeAttribute("data-citlali-veil-hidden");
            document.body.style.removeProperty("--citlali-veil-dim");
            background.remove();
            style.remove();
          };
        }, "dsh-citlali-veil-theme: scene, palette, motion and styles");

        ctx.effect(() => ctx.slots.inject("settings.general.item", () => ctx.slots.register({
          name: "settings.general.item",
          id: "dsh-citlali-veil-theme-settings",
          order: 13,
        }, (props) => h(SettingsCard, {
          ...props,
          context: ctx,
          getSettings: () => settings,
          updateSettings,
        }))), "dsh-citlali-veil-theme: settings controls");
      }

      return { inject: ["slots", "theme"], apply };
    },
  });
})();
