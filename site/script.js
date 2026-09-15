/* ==========================================================================
   Boca Tapas Bar & Grill — site behaviour
   Vanilla JS, no dependencies. Every enhancement is optional: the pages are
   fully usable (and submittable) with JavaScript disabled.
   ========================================================================== */

(function () {
  'use strict';

  var LONDON = 'Europe/London';

  /* Kitchen hours, Monday-first. Times are minutes from midnight; null = closed. */
  var HOURS = {
    0: { label: 'Sunday', open: 720, close: 960 },   // 12:00 – 16:00
    1: { label: 'Monday', open: null, close: null },  // closed
    2: { label: 'Tuesday', open: 1020, close: 1260 }, // 17:00 – 21:00
    3: { label: 'Wednesday', open: 1020, close: 1260 },
    4: { label: 'Thursday', open: 1020, close: 1260 },
    5: { label: 'Friday', open: 1020, close: 1320 },  // 17:00 – 22:00
    6: { label: 'Saturday', open: 720, close: 1320 }  // 12:00 – 22:00
  };

  var DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  /* ------------------------------------------------------------------ *
   * Time helpers
   * ------------------------------------------------------------------ */

  function londonParts(date) {
    var parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: LONDON,
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).formatToParts(date);

    var map = {};
    for (var i = 0; i < parts.length; i += 1) map[parts[i].type] = parts[i].value;

    var weekday = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[map.weekday];
    var hour = parseInt(map.hour, 10) % 24;
    var minute = parseInt(map.minute, 10);

    return { weekday: weekday, minutes: hour * 60 + minute };
  }

  function londonIsoDate(date) {
    var parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: LONDON,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).formatToParts(date);
    var map = {};
    for (var i = 0; i < parts.length; i += 1) map[parts[i].type] = parts[i].value;
    return map.year + '-' + map.month + '-' + map.day;
  }

  function formatTime(minutes) {
    var hours = Math.floor(minutes / 60);
    var mins = minutes % 60;
    var suffix = hours >= 12 ? 'pm' : 'am';
    var display = hours % 12 === 0 ? 12 : hours % 12;
    return display + (mins ? ':' + String(mins).padStart(2, '0') : '') + suffix;
  }

  function shiftDate(date, days) {
    var next = new Date(date.getTime());
    next.setDate(next.getDate() + days);
    return next;
  }

  /** Human description of when Boca is next open, e.g. "Tuesday from 5pm".
      startStep = 1 skips today, for when today's service has already finished. */
  function nextOpening(from, startStep) {
    for (var step = startStep || 0; step < 8; step += 1) {
      var day = shiftDate(from, step);
      var weekday = londonParts(day).weekday;
      var entry = HOURS[weekday];
      if (!entry.open && entry.open !== 0) continue;
      var when = step === 0 ? 'today' : step === 1 ? 'tomorrow' : DAY_NAMES[weekday];
      return when + ' from ' + formatTime(entry.open);
    }
    return 'call us for today\u2019s hours';
  }

  function describeStatus(now) {
    var parts = londonParts(now);
    var today = HOURS[parts.weekday];
    var hasHours = today.open !== null && today.open !== undefined;

    if (hasHours && parts.minutes >= today.open && parts.minutes < today.close) {
      return {
        state: 'open',
        text: 'Open now \u00b7 kitchen until ' + formatTime(today.close)
      };
    }

    if (hasHours && parts.minutes < today.open) {
      return { state: 'closed', text: 'Opens today at ' + formatTime(today.open) };
    }

    if (hasHours) {
      return { state: 'closed', text: 'Closed now \u00b7 opens ' + nextOpening(now, 1) };
    }

    return { state: 'closed', text: 'Closed today \u00b7 opens ' + nextOpening(now) };
  }

  function describeToday(now) {
    var weekday = londonParts(now).weekday;
    var today = HOURS[weekday];
    if (today.open === null || today.open === undefined) return 'Closed today';
    return 'Today ' + formatTime(today.open) + ' \u2013 ' + formatTime(today.close);
  }

  /* ------------------------------------------------------------------ *
   * Dynamic opening hours
   * ------------------------------------------------------------------ */

  function paintHours() {
    var now = new Date();
    var status = describeStatus(now);

    document.querySelectorAll('[data-hours-status]').forEach(function (node) {
      if (node.textContent.trim() !== status.text) node.textContent = status.text;
      node.setAttribute('data-state', status.state);
    });

    document.querySelectorAll('[data-hours-today]').forEach(function (node) {
      node.textContent = describeToday(now);
    });

    var weekday = londonParts(now).weekday;
    document.querySelectorAll('[data-hours-row]').forEach(function (row) {
      row.setAttribute('data-today', String(parseInt(row.getAttribute('data-hours-row'), 10) === weekday));
    });

  }

  /* ------------------------------------------------------------------ *
   * Header, mobile navigation, sticky bar
   * ------------------------------------------------------------------ */

  function initHeader() {
    var header = document.querySelector('.site-header');
    if (header) {
      var onScroll = function () {
        header.classList.toggle('is-scrolled', window.scrollY > 8);
      };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    var toggle = document.querySelector('.nav-toggle');
    var panel = document.getElementById('mobile-nav');
    if (!toggle || !panel) return;

    function close(returnFocus) {
      if (toggle.getAttribute('aria-expanded') !== 'true') return;
      toggle.setAttribute('aria-expanded', 'false');
      panel.hidden = true;
      document.body.classList.remove('nav-open');
      if (returnFocus) toggle.focus();
    }

    function open() {
      toggle.setAttribute('aria-expanded', 'true');
      panel.hidden = false;
      document.body.classList.add('nav-open');
      var first = panel.querySelector('a, button');
      if (first) first.focus();
    }

    toggle.addEventListener('click', function () {
      if (toggle.getAttribute('aria-expanded') === 'true') close(true);
      else open();
    });

    panel.addEventListener('click', function (event) {
      if (event.target.closest('a')) close(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') close(true);
    });

    document.addEventListener('click', function (event) {
      if (toggle.getAttribute('aria-expanded') !== 'true') return;
      if (!panel.contains(event.target) && !toggle.contains(event.target)) close(false);
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth >= 900) close(false);
    });
  }

  function initMobileBar() {
    var bar = document.querySelector('.mobile-bar');
    var footer = document.querySelector('.footer');
    if (!bar || !footer || !('IntersectionObserver' in window)) return;

    new IntersectionObserver(function (entries) {
      bar.classList.toggle('mobile-bar--hidden', entries[0].isIntersecting);
    }, { threshold: 0.15 }).observe(footer);
  }

  /* ------------------------------------------------------------------ *
   * Scroll reveal
   * ------------------------------------------------------------------ */

  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    if (!('IntersectionObserver' in window)) {
      items.forEach(function (item) { item.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });

    items.forEach(function (item) { observer.observe(item); });
  }

  /* ------------------------------------------------------------------ *
   * Gallery lightbox
   * ------------------------------------------------------------------ */

  function initLightbox() {
    var dialog = document.getElementById('lightbox');
    var buttons = document.querySelectorAll('.gallery__item');
    if (!dialog || !buttons.length || typeof dialog.showModal !== 'function') return;

    var image = dialog.querySelector('img');
    var caption = dialog.querySelector('[data-lightbox-caption]');
    var closeBtn = dialog.querySelector('[data-lightbox-close]');
    var lastFocused = null;

    function close() {
      dialog.close();
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        lastFocused = button;
        var img = button.querySelector('img');
        image.src = button.getAttribute('data-full') || (img ? img.src : '');
        image.alt = img ? img.alt : '';
        caption.textContent = button.getAttribute('data-caption') || '';
        dialog.showModal();
        if (closeBtn) closeBtn.focus();
      });
    });

    dialog.addEventListener('click', function (event) {
      if (event.target === dialog) close();
    });

    dialog.addEventListener('close', function () {
      if (lastFocused) lastFocused.focus();
    });

    if (closeBtn) closeBtn.addEventListener('click', close);
  }

  /* ------------------------------------------------------------------ *
   * Menu category chips (scroll spy)
   * ------------------------------------------------------------------ */

  function initMenuNav() {
    var chips = Array.prototype.slice.call(document.querySelectorAll('[data-menu-chip]'));
    if (!chips.length || !('IntersectionObserver' in window)) return;

    var blocks = chips
      .map(function (chip) { return document.querySelector(chip.getAttribute('href')); })
      .filter(Boolean);

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        chips.forEach(function (chip) {
          var active = chip.getAttribute('href') === '#' + entry.target.id;
          chip.setAttribute('aria-current', active ? 'true' : 'false');
        });
      });
    }, { rootMargin: '-25% 0px -65% 0px' });

    blocks.forEach(function (block) { observer.observe(block); });
  }

  /* ------------------------------------------------------------------ *
   * Reservation form
   * ------------------------------------------------------------------ */

  function serviceSlots(isoDate) {
    var day = new Date(isoDate + 'T12:00:00');
    var entry = HOURS[day.getDay()];
    if (entry.open === null || entry.open === undefined) return [];

    var slots = [];
    for (var minutes = entry.open; minutes <= entry.close - 30; minutes += 30) {
      slots.push({ value: String(Math.floor(minutes / 60)).padStart(2, '0') + ':' + String(minutes % 60).padStart(2, '0'), label: formatTime(minutes) });
    }
    return slots;
  }

  function initReservationForm() {
    var form = document.getElementById('reservation-form');
    if (!form) return;

    var dateInput = form.querySelector('#res-date');
    var timeSelect = form.querySelector('#res-time');
    var status = document.getElementById('res-status');

    if (dateInput) {
      dateInput.min = londonIsoDate(new Date());
      var max = new Date();
      max.setDate(max.getDate() + 120);
      dateInput.max = londonIsoDate(max);
      if (!dateInput.value) dateInput.value = dateInput.min;
    }

    function refreshTimes() {
      if (!timeSelect || !dateInput || !dateInput.value) return;
      var previous = timeSelect.value;
      var slots = serviceSlots(dateInput.value);
      timeSelect.innerHTML = '';

      if (!slots.length) {
        var closed = document.createElement('option');
        closed.value = '';
        closed.textContent = 'Closed that day \u2014 please pick another date';
        timeSelect.appendChild(closed);
        timeSelect.disabled = true;
        return;
      }

      timeSelect.disabled = false;
      slots.forEach(function (slot) {
        var option = document.createElement('option');
        option.value = slot.value;
        option.textContent = slot.label;
        timeSelect.appendChild(option);
      });
      timeSelect.value = slots.some(function (slot) { return slot.value === previous; }) ? previous : slots[0].value;
    }

    if (dateInput) {
      dateInput.addEventListener('change', refreshTimes);
      var hasOptions = timeSelect && timeSelect.options.length > 1;
      var selectedDate = dateInput.value;
      if (hasOptions && selectedDate) refreshTimes();
    }

    if (status) status.setAttribute('aria-live', 'polite');

    form.addEventListener('submit', function (event) {
      if (!form.checkValidity()) return;

      event.preventDefault();
      var submit = form.querySelector('button[type="submit"]');
      var original = submit ? submit.textContent : '';
      if (submit) {
        submit.disabled = true;
        submit.textContent = 'Sending\u2026';
      }

      var body = new URLSearchParams(new FormData(form)).toString();

      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body
      })
        .then(function (response) {
          if (!response.ok) throw new Error('Request failed with ' + response.status);
          form.reset();
          if (dateInput) dateInput.value = dateInput.min;
          if (status) {
            status.className = 'form-status form-status--ok';
            status.textContent = 'Thank you \u2014 your table request is in. We\u2019ll confirm by phone shortly.';
            status.hidden = false;
            status.focus();
          }
        })
        .catch(function () {
          if (status) {
            status.className = 'form-status form-status--error';
            status.hidden = false;
            status.innerHTML =
              'Sorry, that didn\u2019t go through. Please call <a href="tel:+441869240877">01869 240877</a> and we\u2019ll sort your table.';
            status.focus();
          }
        })
        .finally(function () {
          if (submit) {
            submit.disabled = false;
            submit.textContent = original;
          }
        });
    });
  }

  /* ------------------------------------------------------------------ *
   * Boot
   * ------------------------------------------------------------------ */

  function boot() {
    paintHours();
    window.setInterval(paintHours, 60000);
    initHeader();
    initMobileBar();
    initReveal();
    initLightbox();
    initMenuNav();
    initReservationForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
