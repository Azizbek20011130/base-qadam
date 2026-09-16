document.addEventListener('DOMContentLoaded', () => {
	const showSavedState = (button, defaultText) => {
		if (!button) return;
		button.classList.remove('save-success');
		void button.offsetWidth;
		button.classList.add('save-success');
		button.innerHTML = 'Сохранено <span>✓</span>';
		clearTimeout(button.saveTimer);
		button.saveTimer = setTimeout(() => {
			button.classList.remove('save-success');
			button.innerHTML = defaultText;
		}, 2200);
	};
	document.querySelectorAll('.sidebar').forEach((sidebar) => {
		sidebar.classList.add('is-collapsed');
		const supportLink = document.createElement('a');
		supportLink.className = 'support-link';
		supportLink.href = 'https://t.me/northern_stormm';
		supportLink.target = '_blank';
		supportLink.rel = 'noopener noreferrer';
		supportLink.innerHTML = '<span class="support-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m21 4-3.2 15.1c-.2 1.1-.8 1.4-1.7.9l-4.8-3.5-2.3 2.2c-.3.3-.5.5-1 .5l.3-4.9 8.9-8c.4-.4-.1-.6-.6-.2L5.6 13.2.9 11.7c-1-.3-1-1 .2-1.5L19.5 3.3C20.3 3 21.8 3.4 21 4Z"/></svg></span><span>Служба поддержки</span>';
		sidebar.appendChild(supportLink);
		const toggle = document.createElement('button');
		toggle.className = 'sidebar-toggle';
		toggle.type = 'button';
		toggle.textContent = '☰';
		toggle.setAttribute('aria-label', 'Раскрыть боковую панель');
		toggle.setAttribute('aria-expanded', 'false');
		toggle.addEventListener('click', () => {
			const collapsed = sidebar.classList.toggle('is-collapsed');
			sidebar.classList.toggle('is-expanded', !collapsed);
			const expanded = !collapsed;
			toggle.setAttribute('aria-expanded', String(expanded));
			toggle.setAttribute('aria-label', expanded ? 'Свернуть боковую панель' : 'Раскрыть боковую панель');
		});
		sidebar.prepend(toggle);
	});
	const navigationIcons = {
		home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>',
		tasks: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 9h8M8 13h8M8 17h5"/></svg>',
		speakers: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16M8 14h3M13 14h3M8 17h3"/></svg>',
		curators: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16M12 13a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM8 19c.5-1.3 1.5-2 3-2M16 19c-.5-1.3-1.5-2-3-2"/></svg>',
		presentation: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4M7 8h10M7 12h6"/></svg>'
	};
	document.querySelectorAll('.nav-item .nav-icon').forEach((icon) => {
		const href = icon.closest('a')?.getAttribute('href') || '';
		const type = href.includes('#tasks') ? 'tasks' : href.includes('curator-schedule') ? 'curators' : href.includes('schedule.html') ? 'speakers' : href.includes('presentation.html') ? 'presentation' : 'home';
		icon.innerHTML = navigationIcons[type];
		icon.classList.add(`nav-icon-${type}`);
	});
	if (!document.querySelector('.sidebar') && document.body.classList.contains('auth-page')) {
		const supportLink = document.createElement('a');
		supportLink.className = 'support-floating';
		supportLink.href = 'https://t.me/northern_stormm';
		supportLink.target = '_blank';
		supportLink.rel = 'noopener noreferrer';
		supportLink.innerHTML = '<span class="support-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m21 4-3.2 15.1c-.2 1.1-.8 1.4-1.7.9l-4.8-3.5-2.3 2.2c-.3.3-.5.5-1 .5l.3-4.9 8.9-8c.4-.4-.1-.6-.6-.2L5.6 13.2.9 11.7c-1-.3-1-1 .2-1.5L19.5 3.3C20.3 3 21.8 3.4 21 4Z"/></svg></span> Служба поддержки';
		document.body.appendChild(supportLink);
	}
	document.querySelectorAll('.user-topbar').forEach((topbar) => {
		if (topbar.querySelector('.presentation-btn')) return;
		const presentationLink = document.createElement('a');
		presentationLink.className = 'presentation-btn';
		presentationLink.href = 'presentation.html';
		presentationLink.innerHTML = '<span><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4M7 8h10M7 12h6"/></svg></span> Презентация';
		topbar.insertBefore(presentationLink, topbar.querySelector('.user-top-actions'));
	});
	const presentationPage = document.querySelector('#presentationPage');
	if (presentationPage) {
		const maxFileSize = 50 * 1024 * 1024;
		const databaseRequest = indexedDB.open('base-project-presentations', 1);
		databaseRequest.onupgradeneeded = () => databaseRequest.result.createObjectStore('files', { keyPath: 'id', autoIncrement: true });
		const fileInput = document.querySelector('#presentationFiles');
		const selectedFiles = [];
		const fileList = document.querySelector('#presentationFileList');
		const message = document.querySelector('#presentationMessage');
		const currentUser = JSON.parse(localStorage.getItem('base-current-user') || '{"login":"qadam123"}');
		const canDeletePresentations = currentUser.login === 'qadam123';
		const formatSize = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)} МБ`;
		const renderSelected = () => {
			fileList.innerHTML = selectedFiles.length ? selectedFiles.map((file, index) => `<li><span>${file.name}</span><small>${formatSize(file.size)}</small><button type="button" data-remove-file="${index}" aria-label="Удалить файл">×</button></li>`).join('') : '<li class="presentation-empty">Файлы пока не выбраны</li>';
		};
		fileInput.addEventListener('change', () => {
			const rejected = [];
			[...fileInput.files].forEach((file) => {
				if (file.size > maxFileSize) rejected.push(file.name);
				else if (!selectedFiles.some((selected) => selected.name === file.name && selected.size === file.size)) selectedFiles.push(file);
			});
			message.textContent = rejected.length ? `Слишком большие файлы: ${rejected.join(', ')}` : `${selectedFiles.length} файл(ов) готовы к сохранению`;
			renderSelected();
			fileInput.value = '';
		});
		fileList.addEventListener('click', (event) => {
			const button = event.target.closest('[data-remove-file]');
			if (!button) return;
			selectedFiles.splice(Number(button.dataset.removeFile), 1);
			renderSelected();
		});
		document.querySelector('#savePresentations').addEventListener('click', () => {
			if (!selectedFiles.length) { message.textContent = 'Сначала выберите хотя бы один файл.'; return; }
			const transaction = databaseRequest.result.transaction('files', 'readwrite');
			selectedFiles.forEach((file) => transaction.objectStore('files').add({ name: file.name, size: file.size, type: file.type, blob: file, savedAt: new Date().toISOString() }));
			transaction.oncomplete = () => { selectedFiles.length = 0; renderSelected(); message.textContent = 'Файлы сохранены в браузере.'; renderSavedFiles(); };
		});
		const renderSavedFiles = () => {
			const transaction = databaseRequest.result.transaction('files', 'readonly');
			const request = transaction.objectStore('files').getAll();
			request.onsuccess = () => {
				const files = request.result;
				document.querySelector('#savedPresentationList').innerHTML = files.length ? files.map((file) => `<li><div><strong>${file.name}</strong><small>${formatSize(file.size)}</small></div><button type="button" data-download-file="${file.id}">Скачать</button>${canDeletePresentations ? `<button type="button" data-delete-file="${file.id}">Удалить</button>` : ''}</li>`).join('') : '<li class="presentation-empty">Сохранённых файлов пока нет</li>';
			};
		};
		document.querySelector('#savedPresentationList').addEventListener('click', (event) => {
			const downloadButton = event.target.closest('[data-download-file]');
			const deleteButton = event.target.closest('[data-delete-file]');
			if (downloadButton) {
				const request = databaseRequest.result.transaction('files', 'readonly').objectStore('files').get(Number(downloadButton.dataset.downloadFile));
				request.onsuccess = () => { const file = request.result; const url = URL.createObjectURL(file.blob); const link = document.createElement('a'); link.href = url; link.download = file.name; link.click(); URL.revokeObjectURL(url); };
			}
			if (deleteButton && canDeletePresentations) {
				const transaction = databaseRequest.result.transaction('files', 'readwrite');
				transaction.objectStore('files').delete(Number(deleteButton.dataset.deleteFile));
				transaction.oncomplete = renderSavedFiles;
			}
		});
		databaseRequest.onsuccess = () => { renderSelected(); renderSavedFiles(); };
	}
	const plansStorageKey = 'base-project-user-plans';
	const planFields = [['links', 'План ссылок на месяц'], ['results', 'План результатов на месяц'], ['reviews', 'План отзывов']];
	const readPlans = () => JSON.parse(localStorage.getItem(plansStorageKey) || '{}');
	const planRows = (userKey, readonly) => planFields.map(([field, label]) => `<div class="plan-row"><label>${label}</label><input type="number" min="0" data-plan-user="${userKey}" data-plan-field="${field}" ${readonly ? 'readonly' : ''} value="${readPlans()[userKey]?.[field] ?? 0}"></div>`).join('');
	const adminTasks = document.querySelector('#tasks');
	if (adminTasks && document.querySelector('#systemDate')) {
		adminTasks.innerHTML = `<div class="panel-heading"><div><p class="section-kicker">02 / ЗАДАНИЯ ПОЛЬЗОВАТЕЛЕЙ</p><h2>Планы пользователей</h2></div><span class="data-sync-label"><i></i> Сохраняются автоматически</span></div><div class="user-plan-admin"><article class="user-plan-card"><div class="user-plan-title"><h3>Задачи для Ильмира</h3><span>Ilmira_qadam</span></div>${planRows('ilmira', false)}<button class="plan-save" data-plan-save="ilmira" type="button">Сохранить планы</button></article><article class="user-plan-card"><div class="user-plan-title"><h3>Задачи для Асал</h3><span>asal_qadam</span></div>${planRows('asal', false)}<button class="plan-save" data-plan-save="asal" type="button">Сохранить планы</button></article><article class="user-plan-card"><div class="user-plan-title"><h3>Задачи для Laziza</h3><span>Laziza_qadam</span></div>${planRows('laziza', false)}<button class="plan-save" data-plan-save="laziza" type="button">Сохранить планы</button></article><article class="user-plan-card"><div class="user-plan-title"><h3>Задачи для Maqsuda</h3><span>Maqsuda_qadam</span></div>${planRows('maqsuda', false)}<button class="plan-save" data-plan-save="maqsuda" type="button">Сохранить планы</button></article></div>`;
	}
	const userStorage = document.body.dataset.userStorage;
	if (userStorage) {
		const heading = document.querySelector('.user-heading');
		if (heading) {
			const planView = document.createElement('section');
			planView.className = 'panel user-plan-view';
			const planNames = { ilmira: 'Ильмира', asal: 'Асал', laziza: 'Laziza', maqsuda: 'Maqsuda', latofat: 'Латофат' };
			planView.innerHTML = `<div class="panel-heading"><div><p class="section-kicker">МОИ ЗАДАЧИ</p><h2>Задачи для ${planNames[userStorage] || userStorage}</h2></div><span class="data-sync-label"><i></i> План от администратора</span></div><div class="user-plan-readonly">${planRows(userStorage, true)}</div>`;
			heading.after(planView);
		}
	}
	const refreshPlans = () => {
		const plans = readPlans();
		document.querySelectorAll('[data-plan-user][data-plan-field]').forEach((input) => {
			const value = plans[input.dataset.planUser]?.[input.dataset.planField];
			if (value !== undefined) input.value = value;
		});
	};
	document.querySelectorAll('[data-plan-save]').forEach((button) => button.addEventListener('click', () => {
		const plans = readPlans();
		const user = button.dataset.planSave;
		plans[user] = {};
		document.querySelectorAll(`[data-plan-user="${user}"][data-plan-field]`).forEach((input) => { plans[user][input.dataset.planField] = Math.max(0, Number(input.value) || 0); });
		localStorage.setItem(plansStorageKey, JSON.stringify(plans));
		showSavedState(button, 'Сохранить планы <span>✓</span>');
	}));
	window.addEventListener('storage', refreshPlans);
	window.addEventListener('focus', refreshPlans);
	if (document.body.classList.contains('asal-user-page')) {
		localStorage.setItem('base-current-user', JSON.stringify({ login: 'asal_qadam', avatar: 'А' }));
	} else if (document.body.classList.contains('laziza-user-page')) {
		localStorage.setItem('base-current-user', JSON.stringify({ login: 'Laziza_qadam', avatar: 'Л' }));
	} else if (document.body.classList.contains('maqsuda-user-page')) {
		localStorage.setItem('base-current-user', JSON.stringify({ login: 'Maqsuda_qadam', avatar: 'М' }));
	} else if (document.body.classList.contains('latofat-user-page')) {
		localStorage.setItem('base-current-user', JSON.stringify({ login: 'Latofat_qadam', avatar: 'Л' }));
	} else if (document.body.classList.contains('ilmira-user-page')) {
		localStorage.setItem('base-current-user', JSON.stringify({ login: 'Ilmira_qadam', avatar: 'И' }));
	}
	const systemDate = document.querySelector('#systemDate');
	const systemTime = document.querySelector('#systemTime');
	const timeGreeting = document.querySelector('#timeGreeting');
	if (systemDate) localStorage.setItem('base-current-user', JSON.stringify({ login: 'qadam123', avatar: 'АЗ' }));
	if (systemDate && systemTime) {
		document.querySelectorAll('.main-content > .topbar, .main-content > .page-heading').forEach((element, index, elements) => {
			if (index < elements.length - 2) element.remove();
		});
		document.querySelectorAll('.content-grid > .side-column').forEach((element, index, elements) => {
			if (index < elements.length - 1) element.remove();
		});
		const firstTaskPerson = document.querySelector('.task-person');
		if (firstTaskPerson) firstTaskPerson.textContent = 'АЗ';
		const updateClock = () => {
			const now = new Date();
			const hour = now.getHours();
			const greeting = hour >= 5 && hour < 11 ? 'Доброе утро' : hour < 15 ? 'Добрый день' : hour < 19 ? 'Добрый вечер' : 'Доброй ночи';
			systemDate.textContent = now.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase();
			systemTime.textContent = now.toLocaleTimeString('ru-RU');
			if (timeGreeting) timeGreeting.textContent = greeting;
		};
		updateClock();
		setInterval(updateClock, 1000);
	}

	const speakersList = document.querySelector('#speakersList');
	if (speakersList) {
		const curatorSchedule = document.body.classList.contains('curator-schedule');
		const speakers = curatorSchedule ? ['Ильмира', 'Асал', 'Латофат'] : ['Хайруллаев Сарвар', 'Ражаббоев Мухаммад', 'Раимжонов Азизбек'];
		const speakerUsers = { Ильмира: 'Ilmira_qadam', Асал: 'asal_qadam', Латофат: 'Latofat_qadam', 'Хайруллаев Сарвар': 'Maqsuda_qadam', 'Ражаббоев Мухаммад': 'Laziza_qadam' };
		const timeSlots = ['11:00–13:00', '13:00–15:00', '15:00–17:00', '17:00–19:00', '19:00–21:00'];
		const currentUser = JSON.parse(localStorage.getItem('base-current-user') || '{"login":"qadam123","avatar":"АЗ"}');
		const isAdmin = currentUser.login === 'qadam123';
		const homeLink = document.querySelector('#scheduleHomeLink');
		const userHomeLinks = { Ilmira_qadam: 'user.html', asal_qadam: 'asal-user.html', Latofat_qadam: 'latofat-user.html', Maqsuda_qadam: 'maqsuda-user.html', Laziza_qadam: 'laziza-user.html' };
		document.querySelectorAll('.admin-only').forEach((item) => { item.hidden = !isAdmin; });
		document.querySelectorAll('.user-only').forEach((item) => { item.hidden = isAdmin; });
		if (homeLink) homeLink.href = userHomeLinks[currentUser.login] || 'index.html';
		const footerName = document.querySelector('.sidebar-footer strong');
		const footerRole = document.querySelector('.sidebar-footer small');
		const footerAvatar = document.querySelector('.sidebar-footer .user-avatar');
		const topAvatar = document.querySelector('.mini-avatar');
		if (footerName) footerName.textContent = currentUser.login;
		if (footerRole) footerRole.textContent = currentUser.login === 'qadam123' ? 'Администратор' : 'Онлайн куратор';
		if (footerAvatar) footerAvatar.textContent = currentUser.avatar;
		if (topAvatar) topAvatar.textContent = currentUser.avatar;
		const storageKey = curatorSchedule ? 'base-project-curator-schedule-daily' : 'base-project-schedule-daily';
		const statusKey = curatorSchedule ? 'base-project-curator-schedule-status' : 'base-project-schedule-status';
		let selectedMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
		const monthFormatter = new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' });
		const weekdayFormatter = new Intl.DateTimeFormat('ru-RU', { weekday: 'short' });
		const getDays = () => {
			const year = selectedMonth.getFullYear();
			const month = selectedMonth.getMonth();
			const daysInMonth = new Date(year, month + 1, 0).getDate();
			return Array.from({ length: daysInMonth }, (_, index) => {
				const date = new Date(year, month, index + 1);
				return { day: index + 1, weekday: weekdayFormatter.format(date).replace('.', '') };
			});
		};
		const monthKey = () => `${selectedMonth.getFullYear()}-${String(selectedMonth.getMonth() + 1).padStart(2, '0')}`;
		const readData = () => JSON.parse(localStorage.getItem(storageKey) || '{}');
		const render = () => {
			const days = getDays();
			document.querySelector('#currentMonth').textContent = monthFormatter.format(selectedMonth).replace(' г.', '');
			const data = readData();
			const statuses = JSON.parse(localStorage.getItem(statusKey) || '{}');
			speakersList.innerHTML = speakers.map((speaker, speakerIndex) => {
				const canEdit = isAdmin || speakerUsers[speaker] === currentUser.login;
				const readOnly = canEdit ? '' : 'readonly';
				const disabled = canEdit ? '' : 'disabled';
				return `<article class="speaker-card ${canEdit ? '' : 'schedule-card-readonly'}"><div class="speaker-card-heading"><div><p class="section-kicker">СПИКЕР ${String(speakerIndex + 1).padStart(2, '0')}</p><h2>${speaker}</h2></div><span class="speaker-total" data-total="${speakerIndex}">0 записей</span></div><div class="schedule-table-scroll"><table class="schedule-table"><thead><tr><th class="time-head">Время</th>${days.map((day) => `<th><span>${day.day}</span><small>${day.weekday}</small></th>`).join('')}</tr></thead><tbody>${timeSlots.map((slot, slotIndex) => `<tr><th>${slot}</th>${days.map((day, dayIndex) => `<td><div class="schedule-cell"><button class="session-status ${statuses[monthKey()]?.[speakerIndex]?.[slotIndex]?.[dayIndex] ? 'is-done' : 'is-not-done'}" data-speaker="${speakerIndex}" data-slot="${slotIndex}" data-day="${dayIndex}" type="button" ${disabled} aria-label="${statuses[monthKey()]?.[speakerIndex]?.[slotIndex]?.[dayIndex] ? 'Проведено' : 'Не проведено'}">${statuses[monthKey()]?.[speakerIndex]?.[slotIndex]?.[dayIndex] ? '✓' : '×'}</button><input data-speaker="${speakerIndex}" data-slot="${slotIndex}" data-day="${dayIndex}" value="${data[monthKey()]?.[speakerIndex]?.[slotIndex]?.[dayIndex] || ''}" placeholder="Свободно" ${readOnly} aria-label="${speaker}, ${slot}, ${day.day} число"></div></td>`).join('')}</tr>`).join('')}</tbody></table></div></article>`;
			}).join('');
			updateTotals();
		};
		const updateTotals = () => {
			speakers.forEach((_, speakerIndex) => {
				const count = speakersList.querySelectorAll(`input[data-speaker="${speakerIndex}"]`).length;
				const filled = [...speakersList.querySelectorAll(`input[data-speaker="${speakerIndex}"]`)].filter((input) => input.value.trim()).length;
				speakersList.querySelector(`[data-total="${speakerIndex}"]`).textContent = `${filled} ${filled === 1 ? 'запись' : 'записей'}`;
			});
		};
		const save = () => {
			const data = readData();
			const statuses = JSON.parse(localStorage.getItem(statusKey) || '{}');
			data[monthKey()] = speakers.map((_, speakerIndex) => timeSlots.map((__, slotIndex) => getDays().map((___, dayIndex) => speakersList.querySelector(`input[data-speaker="${speakerIndex}"][data-slot="${slotIndex}"][data-day="${dayIndex}"]`).value.trim())));
			statuses[monthKey()] = speakers.map((_, speakerIndex) => timeSlots.map((__, slotIndex) => getDays().map((___, dayIndex) => speakersList.querySelector(`.session-status[data-speaker="${speakerIndex}"][data-slot="${slotIndex}"][data-day="${dayIndex}"]`).classList.contains('is-done'))));
			localStorage.setItem(storageKey, JSON.stringify(data));
			localStorage.setItem(statusKey, JSON.stringify(statuses));
			document.querySelector('#scheduleUpdated').textContent = `Сохранено в ${new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
			showSavedState(document.querySelector('#saveSchedule'), 'Сохранить расписание <span>✓</span>');
			updateTotals();
		};
		render();
		speakersList.addEventListener('input', (event) => {
			if (event.target.readOnly) return;
			updateTotals();
			save();
		});
		speakersList.addEventListener('click', (event) => {
			const statusButton = event.target.closest('.session-status');
			if (!statusButton || statusButton.disabled) return;
			statusButton.classList.toggle('is-done');
			statusButton.classList.toggle('is-not-done');
			const completed = statusButton.classList.contains('is-done');
			statusButton.textContent = completed ? '✓' : '×';
			statusButton.setAttribute('aria-label', completed ? 'Проведено' : 'Не проведено');
			save();
		});
		document.querySelector('#saveSchedule').addEventListener('click', save);
		document.querySelector('#previousMonth').addEventListener('click', () => { save(); selectedMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1); render(); });
		document.querySelector('#nextMonth').addEventListener('click', () => { save(); selectedMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1); render(); });
	}

	const metrics = [
		['resultLinks', 'resultLinksProgress'],
		['shopLinks'],
		['monthlyReviews', 'monthlyReviewsProgress']
	];
	const savedMetrics = JSON.parse(localStorage.getItem('base-project-metrics') || '{}');
	metrics.forEach(([inputId, progressId]) => {
		const input = document.querySelector(`#${inputId}`);
		if (!input) return;
		if (savedMetrics[inputId] !== undefined) input.value = savedMetrics[inputId];
		const updateMetric = () => {
			const value = Math.max(0, Number(input.value) || 0);
			input.value = value;
			savedMetrics[inputId] = value;
			localStorage.setItem('base-project-metrics', JSON.stringify(savedMetrics));
			if (progressId) document.querySelector(`#${progressId}`).style.width = `${Math.min(value, 100)}%`;
		};
		input.addEventListener('input', updateMetric);
		updateMetric();
	});

	const authForm = document.querySelector('#authForm');
	if (authForm) {
		const authTabs = document.querySelectorAll('.auth-tab');
		const registerFields = document.querySelectorAll('.register-only');
		const authTitle = document.querySelector('#authTitle');
		const authSubtitle = document.querySelector('#authSubtitle');
		const submitButton = document.querySelector('#submitButton');
		const formMessage = document.querySelector('#formMessage');
		let mode = 'login';

		authTabs.forEach((tab) => tab.addEventListener('click', () => {
			mode = tab.dataset.mode;
			authTabs.forEach((item) => item.classList.toggle('active', item === tab));
			const isRegister = mode === 'register';
			registerFields.forEach((field) => {
				field.style.display = isRegister ? 'block' : 'none';
				field.required = isRegister;
			});
			authTitle.textContent = isRegister ? 'Создайте аккаунт' : 'С возвращением';
			authSubtitle.textContent = isRegister ? 'Заполните данные, чтобы присоединиться к проекту.' : 'Введите данные, чтобы продолжить работу.';
			submitButton.innerHTML = `${isRegister ? 'Создать аккаунт' : 'Войти в аккаунт'} <span>→</span>`;
			formMessage.textContent = '';
		}));

		document.querySelector('.password-toggle').addEventListener('click', (event) => {
			const password = document.querySelector('#password');
			password.type = password.type === 'password' ? 'text' : 'password';
			event.currentTarget.textContent = password.type === 'password' ? '◉' : '◌';
		});

		authForm.addEventListener('submit', (event) => {
			event.preventDefault();
			const email = document.querySelector('#email').value.trim();
			const password = document.querySelector('#password').value;
			formMessage.className = 'form-message';
			if (mode === 'login' && email === 'qadam123' && password === 'qadamuzcard123') {
				localStorage.setItem('base-current-user', JSON.stringify({ login: 'qadam123', avatar: 'АЗ' }));
				formMessage.textContent = 'Вход выполнен. Перенаправляем в проект...';
				formMessage.classList.add('success');
				setTimeout(() => { window.location.href = 'index.html'; }, 700);
				return;
			}
			if (mode === 'login' && email === 'Ilmira_qadam' && password === 'ilmirakurator') {
				localStorage.setItem('base-current-user', JSON.stringify({ login: 'Ilmira_qadam', avatar: 'И' }));
				formMessage.textContent = 'Вход выполнен. Открываем вашу таблицу...';
				formMessage.classList.add('success');
				setTimeout(() => { window.location.href = 'user.html'; }, 700);
				return;
			}
			if (mode === 'login' && email === 'asal_qadam' && password === 'asalkurator') {
				localStorage.setItem('base-current-user', JSON.stringify({ login: 'asal_qadam', avatar: 'А' }));
				formMessage.textContent = 'Вход выполнен. Открываем кабинет Асал...';
				formMessage.classList.add('success');
				setTimeout(() => { window.location.href = 'asal-user.html'; }, 700);
				return;
			}
			if (mode === 'login' && email === 'Laziza_qadam' && password === 'lazizakurator') {
				localStorage.setItem('base-current-user', JSON.stringify({ login: 'Laziza_qadam', avatar: 'Л' }));
				formMessage.textContent = 'Вход выполнен. Открываем кабинет Laziza...';
				formMessage.classList.add('success');
				setTimeout(() => { window.location.href = 'laziza-user.html'; }, 700);
				return;
			}
			if (mode === 'login' && email === 'Maqsuda_qadam' && password === 'maqsuda_kurator') {
				localStorage.setItem('base-current-user', JSON.stringify({ login: 'Maqsuda_qadam', avatar: 'М' }));
				formMessage.textContent = 'Вход выполнен. Открываем кабинет Maqsuda...';
				formMessage.classList.add('success');
				setTimeout(() => { window.location.href = 'maqsuda-user.html'; }, 700);
				return;
			}
			if (mode === 'login' && email === 'Latofat_qadam' && password === 'latofatkurator') {
				localStorage.setItem('base-current-user', JSON.stringify({ login: 'Latofat_qadam', avatar: 'Л' }));
				formMessage.textContent = 'Вход выполнен. Открываем кабинет Латофат...';
				formMessage.classList.add('success');
				setTimeout(() => { window.location.href = 'latofat-user.html'; }, 700);
				return;
			}
			if (mode === 'register' && password === document.querySelector('#confirmPassword').value) {
				formMessage.textContent = 'Аккаунт создан. Теперь можно войти.';
				formMessage.classList.add('success');
				return;
			}
			formMessage.textContent = mode === 'login' ? 'Проверьте логин и пароль.' : 'Пароли должны совпадать.';
		});
	}

	const tableBody = document.querySelector('#tableBody');
	if (tableBody) {
		const userStorage = document.body.dataset.userStorage || 'ilmira';
		const storageKey = `base-project-${userStorage}-table`;
		const lastSaved = document.querySelector('#lastSaved');
		const saveMessage = document.querySelector('#saveMessage');
		const rowCounter = document.querySelector('#rowCounter');
		const fields = ['fio', 'group', 'link', 'result', 'videoReview'];

		const updateCounter = () => {
			const count = tableBody.querySelectorAll('tr').length;
			rowCounter.textContent = `${count} ${count === 1 ? 'строка' : count < 5 ? 'строки' : 'строк'}`;
			tableBody.querySelectorAll('.row-number').forEach((number, index) => {
				number.textContent = index + 1;
			});
		};
		const createRow = (data = {}) => {
			const row = document.createElement('tr');
			row.innerHTML = `<td class="row-number">0</td><td><input data-field="fio" placeholder="Введите ФИО"></td><td><input data-field="group" placeholder="Введите группу"></td><td><input data-field="link" type="url" placeholder="https://..."></td><td><input data-field="result" type="number" min="0" step="1" placeholder="0"></td><td class="checkbox-cell"><label class="table-checkbox"><input data-field="videoReview" type="checkbox"><span></span> Есть видеоотзыв</label></td><td><button class="remove-row" type="button" aria-label="Удалить строку">×</button></td>`;
			fields.forEach((field) => {
				const input = row.querySelector(`[data-field="${field}"]`);
				if (field === 'videoReview') input.checked = data[field] === true || data[field] === 'true';
				else if (data[field] !== undefined) input.value = data[field];
			});
			row.querySelector('.remove-row').addEventListener('click', () => {
				if (tableBody.children.length > 1) row.remove();
				updateCounter();
			});
			tableBody.appendChild(row);
			updateCounter();
		};
		const savedRows = JSON.parse(localStorage.getItem(storageKey) || '[]');
		(savedRows.length ? savedRows : [{}]).forEach(createRow);
		document.querySelector('#addRow').addEventListener('click', () => createRow());
		document.querySelector('#saveTable').addEventListener('click', () => {
			const rows = [...tableBody.querySelectorAll('tr')].map((row) => Object.fromEntries(fields.map((field) => {
				const input = row.querySelector(`[data-field="${field}"]`);
				if (field === 'videoReview') return [field, input.checked];
				if (field === 'result') return [field, input.value === '' ? '' : Number(input.value)];
				return [field, input.value.trim()];
			})));
			localStorage.setItem(storageKey, JSON.stringify(rows.filter((row) => row.fio || row.group || row.link || row.result !== '' || row.videoReview)));
			const time = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
			lastSaved.textContent = `сегодня в ${time}`;
			saveMessage.textContent = 'Данные сохранены';
			saveMessage.classList.add('saved');
			showSavedState(document.querySelector('#saveTable'), 'Сохранить данные <span>✓</span>');
			setTimeout(() => saveMessage.classList.remove('saved'), 2200);
		});
	}

	const renderAdminTable = (bodyId, storageKey) => {
		const body = document.querySelector(`#${bodyId}`);
		if (!body) return;
		const rows = JSON.parse(localStorage.getItem(storageKey) || '[]').filter((row) => row.fio || row.group || row.link || row.result !== '' || row.videoReview);
		const editable = storageKey === 'base-project-ilmira-table' || storageKey === 'base-project-asal-table';
		if (editable) {
			const editableRows = rows.length ? rows : [{}];
			body.innerHTML = editableRows.map((row, index) => `<tr><td class="admin-row-number">${index + 1}</td><td><input class="admin-edit-input" data-admin-field="fio" value="${row.fio || ''}" placeholder="ФИО"></td><td><input class="admin-edit-input" data-admin-field="group" value="${row.group || ''}" placeholder="Группа"></td><td><input class="admin-edit-input" data-admin-field="link" type="url" value="${row.link || ''}" placeholder="https://..."></td><td><input class="admin-edit-input" data-admin-field="result" type="number" min="0" value="${row.result ?? ''}" placeholder="0"></td><td><label class="table-checkbox"><input data-admin-field="videoReview" type="checkbox" ${row.videoReview ? 'checked' : ''}><span></span> Есть видеоотзыв</label></td></tr>`).join('');
			const panel = body.closest('.admin-data-panel');
			if (panel && !panel.querySelector('[data-admin-save]')) {
				const button = document.createElement('button');
				button.className = 'save-btn admin-save-btn';
				button.type = 'button';
				button.dataset.adminSave = storageKey;
				button.innerHTML = 'Сохранить изменения <span>✓</span>';
				panel.appendChild(button);
			}
			return;
		}
	};
	if (document.querySelector('#adminDataBody') || document.querySelector('#asalAdminDataBody')) {
		const renderAllAdminData = () => {
			renderAdminTable('adminDataBody', 'base-project-ilmira-table');
			renderAdminTable('asalAdminDataBody', 'base-project-asal-table');
			renderAdminTable('lazizaAdminDataBody', 'base-project-laziza-table');
			renderAdminTable('maqsudaAdminDataBody', 'base-project-maqsuda-table');
		};
		renderAllAdminData();
		window.addEventListener('storage', renderAllAdminData);
		window.addEventListener('focus', renderAllAdminData);
		document.addEventListener('click', (event) => {
			const button = event.target.closest('[data-admin-save]');
			if (!button) return;
			const body = button.closest('.admin-data-panel').querySelector('tbody');
			const rows = [...body.querySelectorAll('tr')].map((row) => Object.fromEntries(['fio', 'group', 'link', 'result', 'videoReview'].map((field) => {
				const input = row.querySelector(`[data-admin-field="${field}"]`);
				if (field === 'videoReview') return [field, input?.checked || false];
				if (field === 'result') return [field, input?.value === '' ? '' : Number(input?.value)];
				return [field, input?.value.trim() || ''];
			})));
			localStorage.setItem(button.dataset.adminSave, JSON.stringify(rows.filter((row) => row.fio || row.group || row.link || row.result !== '' || row.videoReview)));
			showSavedState(button, 'Сохранить изменения <span>✓</span>');
		});
	}

	const tabs = document.querySelectorAll('.task-tab');
	const tasks = document.querySelectorAll('.task-row');

	tabs.forEach((tab) => {
		tab.addEventListener('click', () => {
			tabs.forEach((item) => item.classList.remove('active'));
			tab.classList.add('active');
			const filter = tab.dataset.filter;
			tasks.forEach((task) => {
				task.hidden = filter !== 'all' && task.dataset.status !== filter;
			});
		});
	});

	document.querySelectorAll('.check-circle:not(.checked)').forEach((check) => {
		check.addEventListener('click', () => {
			check.classList.toggle('checked');
			check.textContent = check.classList.contains('checked') ? '✓' : '';
			check.nextElementSibling.classList.toggle('completed-task');
		});
	});

	const tasksPanel = document.querySelector('#tasks');
	const addTaskButton = document.querySelector('#addTask');
	const viewAllButton = document.querySelector('#viewAll');
	if (tasksPanel && addTaskButton) {
		addTaskButton.addEventListener('click', () => {
			tasksPanel.scrollIntoView({ behavior: 'smooth' });
			tasksPanel.classList.add('focus-panel');
			setTimeout(() => tasksPanel.classList.remove('focus-panel'), 900);
		});
	}
	if (tasksPanel && viewAllButton) {
		viewAllButton.addEventListener('click', () => {
			tasksPanel.scrollIntoView({ behavior: 'smooth' });
		});
	}
});
