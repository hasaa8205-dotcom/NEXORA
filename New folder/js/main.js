(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const makeElement = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };
  const makeToolLogo = (tool) => {
    const logo = makeElement("span", `tool-logo tone-${tool.tone}`, tool.logo ? undefined : tool.monogram);
    if (tool.logo) {
      const image = makeElement("img", "tool-logo-image");
      image.src = tool.logo;
      image.alt = "";
      logo.append(image);
    }
    return logo;
  };
  const announceStorageIssue = (message) => {
    const notice = document.querySelector("#storage-feedback");
    if (notice) {
      notice.textContent = message;
      notice.classList.add("is-visible", "is-error");
    }
  };
  const readStoredList = (key) => {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];
    } catch (error) {
      console.error(`NEXORA AI: Could not read ${key} from local storage.`, error);
      announceStorageIssue("Хөтчийн сан ашиглах боломжгүй байна. Өөрчлөлт хадгалагдахгүй байж болзошгүй.");
      return [];
    }
  };
  const writeStoredList = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`NEXORA AI: Could not write ${key} to local storage.`, error);
      announceStorageIssue("Хөтчийн сан ашиглах боломжгүй байна. Өөрчлөлт хадгалагдахгүй.");
      return false;
    }
  };
  const copyText = async (text, button, status) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      const field = makeElement("textarea");
      field.value = text;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.append(field);
      field.select();
      const copied = document.execCommand("copy");
      field.remove();
      if (!copied) {
        if (status) status.textContent = "Хуулж чадсангүй. Зааврыг сонгон гараар хуулна уу.";
        return;
      }
    }
    button.textContent = "Хуулагдлаа";
    button.classList.add("is-copied");
    if (status) status.textContent = "Зааврыг түр санах ойд хууллаа.";
    window.setTimeout(() => {
      button.textContent = button.dataset.defaultLabel || "Хуулах";
      button.classList.remove("is-copied");
    }, 1700);
  };

  const revealItems = [...document.querySelectorAll(".reveal")];
  if ("IntersectionObserver" in window && !reducedMotion.matches) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-revealed");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -24px 0px" });
    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-revealed"));
  }

  const hero = document.querySelector(".home-hero");
  if (hero && !reducedMotion.matches && window.matchMedia("(pointer: fine)").matches) {
    const orb = hero.querySelector(".hero-orb");
    let frame = 0;
    hero.addEventListener("pointermove", (event) => {
      if (frame) window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const bounds = hero.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;
        orb.style.setProperty("--orb-tilt-x", `${-y * 7}px`);
        orb.style.setProperty("--orb-tilt-y", `${x * 7}px`);
        hero.style.setProperty("--parallax-x", `${x * 10}px`);
        hero.style.setProperty("--parallax-y", `${y * 8}px`);
        frame = 0;
      });
    });
    hero.addEventListener("pointerleave", () => {
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
      orb.style.removeProperty("--orb-tilt-x");
      orb.style.removeProperty("--orb-tilt-y");
      hero.style.removeProperty("--parallax-x");
      hero.style.removeProperty("--parallax-y");
    });
  }

  if (!reducedMotion.matches && window.matchMedia("(pointer: fine)").matches) {
    document.querySelectorAll(".magnetic").forEach((button) => {
      button.addEventListener("pointermove", (event) => {
        const bounds = button.getBoundingClientRect();
        button.style.setProperty("--magnetic-x", `${(event.clientX - bounds.left - bounds.width / 2) * 0.08}px`);
        button.style.setProperty("--magnetic-y", `${(event.clientY - bounds.top - bounds.height / 2) * 0.08}px`);
      });
      button.addEventListener("pointerleave", () => {
        button.style.removeProperty("--magnetic-x");
        button.style.removeProperty("--magnetic-y");
      });
    });
  }

  const tools = Array.isArray(window.NexoraTools) ? window.NexoraTools : [];
  let favorites = readStoredList("nexora-favorite-tools").filter((name) => tools.some((tool) => tool.name === name));

  const renderFavorites = () => {
    const grid = document.querySelector("#favorites-grid");
    if (!grid) return;
    grid.replaceChildren();
    const savedTools = tools.filter((tool) => favorites.includes(tool.name));
    savedTools.forEach((tool) => {
      const card = makeElement("article", "favorite-card reveal is-revealed");
      const top = makeElement("div", "favorite-card-top");
      top.append(makeToolLogo(tool), makeElement("span", "tool-category", tool.category));
      const name = makeElement("h3", "", tool.name);
      const description = makeElement("p", "tool-description", tool.description);
      const link = makeElement("a", "text-link", "Албан ёсны сайтад зочлох ↗");
      link.href = tool.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      const remove = makeElement("button", "tool-details-button", "Хадгалснаас хасах");
      remove.type = "button";
      remove.addEventListener("click", () => toggleFavorite(tool.name));
      card.append(top, name, description, link, remove);
      grid.append(card);
    });
    const count = document.querySelector("#favorite-count");
    const empty = document.querySelector("#favorites-empty");
    if (count) count.textContent = String(savedTools.length);
    if (empty) empty.hidden = savedTools.length !== 0;
  };

  const renderComparison = () => {
    const results = document.querySelector("#comparison-results");
    const selectors = document.querySelector("#compare-selectors");
    if (!results || !selectors) return;
    const selectedNames = [...selectors.querySelectorAll("select")].map((select) => select.value).filter(Boolean);
    const selectedTools = selectedNames.map((name) => tools.find((tool) => tool.name === name)).filter(Boolean);
    const count = document.querySelector("#compare-count");
    if (count) count.textContent = `${selectedTools.length} / 3`;
    results.replaceChildren();
    if (!selectedTools.length) return;
    const table = makeElement("table", "comparison-table");
    const head = document.createElement("thead");
    const heading = document.createElement("tr");
    heading.append(makeElement("th", "", "Үзүүлэлт"));
    selectedTools.forEach((tool) => heading.append(makeElement("th", "", tool.name)));
    head.append(heading);
    const body = document.createElement("tbody");
    [
      ["Ангилал", (tool) => tool.category],
      ["Гол боломжууд", (tool) => tool.features.join(" · ")],
      ["Үнийн мэдээлэл", () => "Баталгаажаагүй"]
    ].forEach(([label, value]) => {
      const row = document.createElement("tr");
      row.append(makeElement("th", "", label));
      selectedTools.forEach((tool) => row.append(makeElement("td", "", value(tool))));
      body.append(row);
    });
    table.append(head, body);
    results.append(table);
  };

  const renderTools = () => {
    const grid = document.querySelector("#tool-grid");
    if (!grid) return;
    const query = (document.querySelector("#tool-search")?.value || "").trim().toLowerCase();
    const category = grid.dataset.category || "All";
    const pricing = document.querySelector("#tool-pricing-filter")?.value || "all";
    const beginnerOnly = document.querySelector("#tool-beginner-filter")?.checked || false;
    const visibleTools = tools.filter((tool) => {
      const text = `${tool.name} ${tool.description} ${tool.category} ${tool.features.join(" ")} ${tool.searchTerms}`.toLowerCase();
      return (category === "All" || category === "Бүгд" || tool.category === category)
        && (pricing === "all" || tool.pricing === pricing)
        && (!beginnerOnly || tool.beginnerFriendly)
        && text.includes(query);
    });
    grid.replaceChildren();
    visibleTools.forEach((tool) => {
      const card = makeElement("article", "tool-card reveal is-revealed");
      const top = makeElement("div", "tool-card-top");
      top.append(makeToolLogo(tool), makeElement("span", "tool-category", tool.category));
      const favorite = makeElement("button", `icon-button${favorites.includes(tool.name) ? " is-favorite" : ""}`, favorites.includes(tool.name) ? "★" : "☆");
      favorite.type = "button";
      favorite.setAttribute("aria-label", `${tool.name} ${favorites.includes(tool.name) ? "хадгалснаас хасах" : "хадгалсан зүйлд нэмэх"}`);
      favorite.setAttribute("aria-pressed", String(favorites.includes(tool.name)));
      favorite.addEventListener("click", () => toggleFavorite(tool.name));
      top.append(favorite);
      const title = makeElement("h3", "", tool.name);
      const description = makeElement("p", "tool-description", tool.description);
      const price = makeElement("span", "tool-pricing", "Үнэ: баталгаажаагүй");
      const featureList = makeElement("ul", "tool-features");
      tool.features.forEach((feature) => featureList.append(makeElement("li", "", feature)));
      const details = makeElement("button", "tool-details-button", "Дэлгэрэнгүй үзэх");
      details.type = "button";
      details.addEventListener("click", () => showToolDetails(tool));
      const external = makeElement("a", "tool-link", "Албан ёсны сайтад зочлох ↗");
      external.href = tool.url;
      external.target = "_blank";
      external.rel = "noopener noreferrer";
      card.append(top, title, description, price, featureList, details, external);
      grid.append(card);
    });
    const count = document.querySelector("#tool-count");
    const empty = document.querySelector("#tool-empty");
    if (count) count.textContent = `${visibleTools.length} хэрэгсэл`;
    if (empty) empty.hidden = visibleTools.length !== 0;
  };

  const toggleFavorite = (name) => {
    favorites = favorites.includes(name) ? favorites.filter((item) => item !== name) : [...favorites, name];
    writeStoredList("nexora-favorite-tools", favorites);
    renderFavorites();
    renderTools();
  };

  const showToolDetails = (tool) => {
    const dialog = document.querySelector("#tool-dialog");
    const content = document.querySelector("#tool-dialog-content");
    if (!dialog || !content) return;
    content.replaceChildren(
      makeElement("p", "eyebrow", tool.category),
      makeElement("h2", "", tool.name),
      makeElement("p", "section-intro", tool.description),
      makeElement("h3", "", "Гол боломжууд")
    );
    const list = makeElement("ul", "tool-features");
    tool.features.forEach((feature) => list.append(makeElement("li", "", feature)));
    const note = makeElement("p", "tool-pricing", "Үнийг бие даан баталгаажуулаагүй. Үйлчилгээ үзүүлэгчийн албан ёсны сайтаас шалгана уу.");
    const link = makeElement("a", "button button-primary", "Албан ёсны сайтад зочлох ↗");
    link.href = tool.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    content.append(list, note, link);
    dialog.showModal();
  };

  const toolFilters = document.querySelector("#tool-filters");
  if (toolFilters) {
    const categories = ["All", ...new Set(tools.map((tool) => tool.category))];
    const drawToolFilters = (active) => {
      toolFilters.replaceChildren();
      categories.forEach((category) => {
        const chip = makeElement("button", `filter-chip${category === active ? " is-active" : ""}`, category === "All" ? "Бүгд" : category);
        chip.type = "button";
        chip.setAttribute("aria-pressed", String(category === active));
        chip.addEventListener("click", () => {
          document.querySelector("#tool-grid").dataset.category = category;
          drawToolFilters(category);
          renderTools();
        });
        toolFilters.append(chip);
      });
    };
    drawToolFilters("All");
  }
  document.querySelector("#tool-search")?.addEventListener("input", renderTools);
  document.querySelector("#tool-pricing-filter")?.addEventListener("change", renderTools);
  document.querySelector("#tool-beginner-filter")?.addEventListener("change", renderTools);
  document.querySelector("#tool-clear-filters")?.addEventListener("click", () => {
    const search = document.querySelector("#tool-search");
    const grid = document.querySelector("#tool-grid");
    const price = document.querySelector("#tool-pricing-filter");
    const beginner = document.querySelector("#tool-beginner-filter");
    if (search) search.value = "";
    if (grid) grid.dataset.category = "All";
    if (price) price.value = "all";
    if (beginner) beginner.checked = false;
    toolFilters?.querySelectorAll(".filter-chip").forEach((chip, index) => {
      const active = index === 0;
      chip.classList.toggle("is-active", active);
      chip.setAttribute("aria-pressed", String(active));
    });
    renderTools();
  });

  const compareSelectors = document.querySelector("#compare-selectors");
  if (compareSelectors) {
    for (let index = 0; index < 3; index += 1) {
      const select = document.createElement("select");
      select.className = "compare-select";
      select.setAttribute("aria-label", `Харьцуулах хэрэгсэл ${index + 1}`);
      const empty = makeElement("option", "", "Хэрэгсэл сонгох");
      empty.value = "";
      select.append(empty);
      tools.forEach((tool) => {
        const option = makeElement("option", "", tool.name);
        option.value = tool.name;
        select.append(option);
      });
      select.addEventListener("change", () => {
        const chosen = [...compareSelectors.querySelectorAll("select")].map((item) => item.value).filter(Boolean);
        if (new Set(chosen).size !== chosen.length) {
          select.value = "";
          const feedback = document.querySelector("#compare-feedback");
          if (feedback) feedback.textContent = "Хэрэгсэл бүрийг зөвхөн нэг удаа сонгоно уу.";
        } else {
          const feedback = document.querySelector("#compare-feedback");
          if (feedback) feedback.textContent = "";
          renderComparison();
        }
      });
      compareSelectors.append(select);
    }
  }
  renderTools();
  renderFavorites();

  const academyProgress = document.querySelector("#academy-progress-label");
  const lessonCards = [...document.querySelectorAll(".lesson-card")];
  if (academyProgress && lessonCards.length) {
    const completed = new Set(readStoredList("nexora-completed-lessons"));
    const updateProgress = () => {
      const label = document.querySelector("#academy-progress-label");
      const bar = document.querySelector("#academy-progress-bar");
      if (label) label.textContent = `${completed.size} / ${lessonCards.length} хичээл дууссан`;
      if (bar) bar.style.width = `${completed.size / lessonCards.length * 100}%`;
    };
    lessonCards.forEach((lesson, index) => {
      const label = makeElement("label", "lesson-completion");
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = completed.has(String(index));
      checkbox.setAttribute("aria-label", `${lesson.querySelector(".lesson-title").textContent} хичээлийг дууссанд тэмдэглэх`);
      label.append(checkbox, makeElement("span", "", "Хичээл дууссан"));
      lesson.querySelector(".lesson-content").append(label);
      checkbox.addEventListener("change", () => {
        if (checkbox.checked) completed.add(String(index));
        else completed.delete(String(index));
        writeStoredList("nexora-completed-lessons", [...completed]);
        updateProgress();
      });
    });

    const visibleLessons = () => lessonCards.filter((lesson) => !lesson.hidden);
    const showLesson = (index) => {
      const visible = visibleLessons();
      if (!visible.length) return;
      const bounded = Math.max(0, Math.min(visible.length - 1, index));
      visible.forEach((lesson, itemIndex) => { lesson.open = itemIndex === bounded; });
      const current = document.querySelector("#lesson-current");
      const previous = document.querySelector("#lesson-previous");
      const next = document.querySelector("#lesson-next");
      if (current) current.textContent = `${visible.length} хичээлийн ${bounded + 1}`;
      if (previous) previous.disabled = bounded === 0;
      if (next) next.disabled = bounded === visible.length - 1;
    };
    const previous = document.querySelector("#lesson-previous");
    const next = document.querySelector("#lesson-next");
    previous?.addEventListener("click", () => showLesson(visibleLessons().findIndex((lesson) => lesson.open) - 1));
    next?.addEventListener("click", () => showLesson(visibleLessons().findIndex((lesson) => lesson.open) + 1));
    lessonCards.forEach((lesson) => lesson.addEventListener("toggle", () => {
      if (!lesson.open) return;
      const visible = visibleLessons();
      const index = visible.indexOf(lesson);
      const current = document.querySelector("#lesson-current");
      if (current) current.textContent = `${visible.length} хичээлийн ${index + 1}`;
      if (previous) previous.disabled = index === 0;
      if (next) next.disabled = index === visible.length - 1;
    }));
    document.querySelectorAll("[data-level-filter]").forEach((button) => {
      button.addEventListener("click", () => {
        document.querySelectorAll("[data-level-filter]").forEach((item) => {
          const active = item === button;
          item.classList.toggle("is-active", active);
          item.setAttribute("aria-pressed", String(active));
        });
        lessonCards.forEach((lesson) => {
          lesson.hidden = button.dataset.levelFilter !== "all" && lesson.dataset.level !== button.dataset.levelFilter;
          lesson.open = false;
        });
        if (previous) previous.disabled = true;
        if (next) next.disabled = visibleLessons().length < 2;
        const current = document.querySelector("#lesson-current");
        if (current) current.textContent = visibleLessons().length ? "Хичээл сонгоно уу" : "Энэ түвшинд хичээл алга";
      });
    });
    updateProgress();
    if (next) next.disabled = false;
  }

  const promptGrid = document.querySelector("#prompt-grid");
  if (promptGrid && Array.isArray(window.NexoraPrompts)) {
    const search = document.querySelector("#prompt-search");
    const filters = document.querySelector("#prompt-filters");
    let selectedCategory = "All";
    const categories = ["All", ...new Set(window.NexoraPrompts.map((prompt) => prompt.category))];
    const renderPrompts = () => {
      const query = (search?.value || "").trim().toLowerCase();
      const prompts = window.NexoraPrompts.filter((prompt) => (selectedCategory === "All" || prompt.category === selectedCategory)
        && `${prompt.title} ${prompt.category} ${prompt.description} ${prompt.prompt}`.toLowerCase().includes(query));
      promptGrid.replaceChildren();
      prompts.forEach((prompt) => {
        const card = makeElement("article", "prompt-card reveal is-revealed");
        card.append(makeElement("span", "prompt-category", prompt.category), makeElement("h3", "", prompt.title), makeElement("p", "prompt-description", prompt.description), makeElement("blockquote", "prompt-text", prompt.prompt));
        const copy = makeElement("button", "copy-button", "Заавар хуулах");
        copy.type = "button";
        copy.dataset.defaultLabel = "Заавар хуулах";
        copy.addEventListener("click", () => copyText(prompt.prompt, copy, document.querySelector("#studio-status")));
        card.append(copy);
        promptGrid.append(card);
      });
      const count = document.querySelector("#prompt-count");
      const empty = document.querySelector("#prompt-empty");
      if (count) count.textContent = `${prompts.length} заавар`;
      if (empty) empty.hidden = prompts.length !== 0;
    };
    if (filters) {
      const drawFilters = () => {
        filters.replaceChildren();
        categories.forEach((category) => {
          const chip = makeElement("button", `filter-chip${category === selectedCategory ? " is-active" : ""}`, category === "All" ? "Бүгд" : category);
          chip.type = "button";
          chip.setAttribute("aria-pressed", String(category === selectedCategory));
          chip.addEventListener("click", () => {
            selectedCategory = category;
            drawFilters();
            renderPrompts();
          });
          filters.append(chip);
        });
      };
      drawFilters();
    }
    search?.addEventListener("input", renderPrompts);
    renderPrompts();
  }

  const studio = document.querySelector("#prompt-studio");
  if (studio) {
    const output = document.querySelector("#studio-output");
    const copy = document.querySelector("#studio-copy");
    const status = document.querySelector("#studio-status");
    studio.addEventListener("submit", (event) => {
      event.preventDefault();
      const values = new FormData(studio);
      const task = String(values.get("task") || "").trim();
      if (!task) return;
      const context = String(values.get("instructions") || "").trim();
      output.value = [
        `${values.get("taskType")}: ${task}`,
        `Хариултыг ${values.get("language")} бэлтгэнэ үү.`,
        `${values.get("style")} өнгө аясыг ашиглана уу.`,
        `Хариултыг ${values.get("format")} хэлбэрээр бэлтгэнэ үү.`,
        context ? `Нөхцөл ба шаардлага: ${context}` : "",
        "Чухал мэдээлэл дутуу байвал таамаглахын оронд тодруулах асуулт асууна уу. Баталгаатай баримтыг эргэлзээтэй мэдээллээс ялгаж тэмдэглэнэ үү."
      ].filter(Boolean).join("\n\n");
      copy.disabled = false;
      if (status) status.textContent = "Заавар үүслээ. Хуулахаасаа өмнө нягталж, засварлана уу.";
      output.focus();
    });
    output.addEventListener("input", () => {
      copy.disabled = !output.value.trim();
      if (status) status.textContent = "";
    });
    copy.dataset.defaultLabel = "Заавар хуулах";
    copy.addEventListener("click", () => copyText(output.value, copy, status));
  }

  document.querySelectorAll("[data-showcase-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-showcase-filter]").forEach((item) => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      document.querySelectorAll("[data-showcase-category]").forEach((card) => {
        card.hidden = button.dataset.showcaseFilter !== "all" && card.dataset.showcaseCategory !== button.dataset.showcaseFilter;
      });
    });
  });
})();
