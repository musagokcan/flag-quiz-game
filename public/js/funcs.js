import {APP, NORMAL_FLAGS, GAME_STRUCTURE, SCR, BODY} from './defines.js?v=0.0.10'
import Scenes from './scenes.js?v=0.0.10'
import Fictions from './fictions.js?v=0.0.10'

export const preload = async function(){
	await fBinder()
	await checkers()
	await tabber()
	await dropdown()
	// await soundToggle()
}

export const dropdown = async function(){
	const open = async function(element){
		element.classList.add('active')

		const closeHandler = function(){
			close(element, closeHandler)
		}

		APP.addEventListener('click', closeHandler)
	}

	const close = async function(element, handler){
		element.classList.remove('active')
		APP.removeEventListener('click', handler)
	}

	APP.addEventListener('click', async function(event){
		const target = event.target.closest('[data-dr-target]')
		if(target){
			const targetAttr = target.getAttribute('data-dr-target')
			const dropdownULDOM = APP.querySelector(`[data-dr='${targetAttr}']`)

			if(dropdownULDOM){
				if(dropdownULDOM.classList.contains('active')){
					await close(dropdownULDOM)
				}else{
					await open(dropdownULDOM)
				}
			}
		}
	})
}

export const soundToggle = async function(){
	APP.addEventListener('click', async function(event){
		const target = event.target.closest('[data-sound-toggle]')
		if(target){
			const targetAttr = target.getAttribute('data-sound-toggle')
			const targetIMGDOM = target.querySelector('img')

			if(targetAttr === 'on'){
				targetIMGDOM.src = `../public/img/icons/sound-on.svg`
				target.setAttribute('data-sound-toggle', 'off')
				await alerty('Ses açık')
			}else if(targetAttr === 'off'){
				targetIMGDOM.src = `../public/img/icons/sound-off.svg`
				target.setAttribute('data-sound-toggle', 'on')
				await alerty('Ses kapalı')
			}

			localStorage.setItem('sound', targetAttr)
			GAME_STRUCTURE.game_sound = targetAttr
		}
	})
}

export const alerty = async function(text, type = '', time = 1250){
	const alertyDOM = APP.querySelector('.alerty')

	if(text && text.length > 0){
		if(alertyDOM){
			alertyDOM.remove()
		}

		const alertyTheme = `<div class="alerty in ${type}"><span>${text}</span></div>`
		APP.insertAdjacentHTML('beforeend', alertyTheme)

		const newAlertyDOM = APP.querySelector('.alerty')
		if(newAlertyDOM){
			setTimeout(async function(){
				newAlertyDOM.classList.remove('in')
				newAlertyDOM.classList.add('out')
			}, time)
		}
	}
}

export const tabber = async function(){
	APP.addEventListener('click', async function(event){
		const targetLIDOM = event.target.closest('.leaderboard-tabs ul li')
		if(targetLIDOM && !targetLIDOM.classList.contains('active')){

			const tabs = APP.querySelectorAll('.leaderboard-tabs ul li')
			const tabContents = APP.querySelectorAll('.leaderboard-contents .leaderboard-content')

			const targetADOM = targetLIDOM.querySelector('a')
			const targetADataTarget = targetADOM.getAttribute('data-target')
			
			for(const tabLI of tabs){
				tabLI.classList.remove('active')
			}

			for(const tabContent of tabContents){
				tabContent.classList.remove('active')
				if(tabContent.getAttribute('data-tab') === targetADataTarget){
					tabContent.classList.add('active')
					targetLIDOM.classList.add('active')
				}
			}

			const globalTabIMGDOM = APP.querySelector('.leaderboard-tabs ul li.global-tab img')
			if(targetADataTarget === 'global'){
				globalTabIMGDOM.src = `../public/img/icons/global-active.svg`
			}else{
				globalTabIMGDOM.src = `../public/img/icons/global-passive.svg`
			}

		}
	})
}

export const topFlags = async function(){
	const selectedLanguages = await getRandomElements(NORMAL_FLAGS, 30)

	let topFlagsTheme = ''

	for(const languageCode of selectedLanguages){
		topFlagsTheme += `<span><img alt="${languageCode}" loading="lazy" src="../public/img/flags/${languageCode}.svg" height="100%" /></span>`
	}

	topFlagsTheme = `<div class="top-flags in">${topFlagsTheme}</div>`

	APP.insertAdjacentHTML('afterbegin', topFlagsTheme)
}

export const version = async function(){
	let versionTheme = `<div class="version">v1.0.0</div>`

	APP.insertAdjacentHTML('afterbegin', versionTheme)
}

export const getLeaders = async function(countryLeaders = false){
	const owner = localStorage.getItem('lb_id') !== null ? localStorage.getItem('lb_id') : 0

	let countryData = `&countryCode=${_LANG}`
	let ownerData = `&owner=${owner}`

	let fetchUrl = '../core/getter.php?getLeaders=1'

	if(countryLeaders === true){
		fetchUrl += countryData
	}

	if(owner !== 0){
		fetchUrl += ownerData
	}

	const response = await fetch(fetchUrl)
	return response.json()
}

export const saveScore = async function(){
	APP.addEventListener('click', async function(event){
		const target = event.target.closest('#saveScore')

		if(target){
			const GAME_FLOW_STORAGE = JSON.parse(localStorage.getItem('GAME_FLOW'))
			const GAME_STRUCTURE_STORAGE = JSON.parse(localStorage.getItem('GAME_STRUCTURE'))

			const GAME_FLOW_STORAGE_OBJ_KEYS = Object.keys(GAME_FLOW_STORAGE)
			const GAME_STRUCTURE_STORAGE_OBJ_KEYS = Object.keys(GAME_STRUCTURE_STORAGE)

			const GAME_FLOW_STORAGE_OBJ_ENTRIES = Object.entries(GAME_FLOW_STORAGE)
			const GAME_STRUCTURE_STORAGE_OBJ_ENTRIES = Object.entries(GAME_STRUCTURE_STORAGE)

			let data = ''

			const scoreOwnerInput = APP.querySelector('input#score_owner')
			const scoreOwnerInputVal = scoreOwnerInput.value

			if(GAME_FLOW_STORAGE_OBJ_KEYS.length > 0){
				for(const gameFlow of GAME_FLOW_STORAGE_OBJ_ENTRIES){
					const gameFlowKey = gameFlow[0]
					const gameFlowVal = gameFlow[1]

					data += `&${gameFlowKey}=${gameFlowVal}`
				}
			}

			if(GAME_STRUCTURE_STORAGE_OBJ_KEYS.length > 0){
				for(const gameStructure of GAME_STRUCTURE_STORAGE_OBJ_ENTRIES){
					const gameStructureKey = gameStructure[0]
					const gameStructureVal = gameStructure[1]

					data += `&${gameStructureKey}=${gameStructureVal}`
				}
			}

			const fetchUrl = `../core/getter.php?saveScore=1&score_owner=${scoreOwnerInputVal}&owner_language=${_LANG+data}`
			const response = await fetch(fetchUrl)
			const responseJSON = await response.json()
			const result = responseJSON.result

			let alertyReaction
			let alertyType = 'error'

			if(result.type === 'success'){
				if(result.data.lb_id){
					localStorage.setItem('lb_id', result.data.lb_id)

					alertyReaction = 'Skor başarıyla kaydedildi'
					alertyType = 'success'

					APP.innerHTML = await Scenes['LeaderBoard']()
				}
			}else if(result.type === 'invalid_owner'){
				alertyReaction = 'Geçersiz skor sahibi bilgisi'
			}else{
				alertyReaction = 'Bir hata oluştu'
			}

			await alerty(alertyReaction, alertyType, 2000)
		}
		
	})
}

export const contact = async function(){
	APP.addEventListener('click', async function(event){
		const target = event.target.closest('#contact')

		if(target){
			const contactEmailInput = APP.querySelector('input#contact_email')
			const contactEmailInputVal = contactEmailInput.value

			const contactMessageInput = APP.querySelector('textarea#contact_message')
			const contactMessageInputVal = contactMessageInput.value

			let data = `&contact_email=${contactEmailInputVal}&contact_message=${contactMessageInputVal}`

			const fetchUrl = `../core/getter.php?contact=1&contact_language=${_LANG+data}`
			const response = await fetch(fetchUrl)
			const responseJSON = await response.json()
			const result = responseJSON.result

			let alertyReaction
			let alertyType = 'error'

			if(result.type === 'success'){
				alertyReaction = 'Mesajınız başarıyla iletildi'
				alertyType = 'success'

				APP.innerHTML = await Scenes['Welcome']()
				await topFlags()
				await version()
			}else if(result.type === 'invalid_email'){
				alertyReaction = 'E-posta adresi geçersiz'
			}else{
				alertyReaction = 'Bir hata oluştu'
			}

			await alerty(alertyReaction, alertyType, 2000)
		}
		
	})
}

export const fBinder = async function(){
	APP.addEventListener('click', async function(event){
		new Audio()

		const fBindElement = event.target.closest('[data-f]')

		if(fBindElement){
			const fData = fBindElement.getAttribute('data-f')

			const pageInElements = APP.querySelectorAll('.page-in')
			if(pageInElements){
				for(const pageInElement of pageInElements){
					pageInElement.classList.remove('page-in')
					pageInElement.classList.add('page-out')
				}

				setTimeout(async function(){
					APP.innerHTML = await Scenes[fData]()
					if(fData === 'Welcome'){
						await topFlags()
						await version()
					}

					await pageContentAdapter()
					const fictionFunc = Fictions[fData]
					if(fictionFunc){
						await fictionFunc()
					}
				}, 350)
			}
			
		}
	})
}

export const checkers = async function(){
	APP.addEventListener('change', async function(event){
		const target = event.target.closest('.checkbox')
		if(target){
			const targetInput = target.querySelector('input')
			const targetLabel = target.querySelector('label')

			const left = targetLabel.querySelector('.left')
			const leftImg = left.querySelector('img')

			if(targetInput.checked){
				left.classList.add('active')
				leftImg.classList.remove('d-none')
				document.documentElement.requestFullscreen()
			}else{
				left.classList.remove('active')
				leftImg.classList.add('d-none')
				document.exitFullscreen()
			}
		}
	})
}

export const shuffle = async function(array) {
	for(let i=array.length-1;i>=0;i--){
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}

	return array
}

export const pointsFormat = async function(point){
	return Number(point).toFixed(2)
}

export const timeFormat = async function(time){
	let h = Math.floor(time / 3600)
	let m = Math.floor((time % 3600) / 60)
	let s = time % 60

	let result = []
	if(h > 0){
		result.push(`${h} saat`)
	}

	if(m > 0){
		result.push(`${m} dakika`)
	}

	if(s > 0){
		result.push(`${s} saniye`)
	}

	return result.join(" ")
}

export const createFirework = async function(element){
	const rect = element.getBoundingClientRect()

	const x = rect.left+rect.width/2
	const y = rect.top+rect.height/2

	for(let i=0;i<20;i++){
		let particle = document.createElement('div')
		particle.classList.add('firework')

		let angle = (Math.PI*2*i) / 20
		let distance = Math.random()*100+50

		let xMove = `${Math.cos(angle)*distance}px`
		let yMove = `${Math.sin(angle)*distance}px`

		particle.style.setProperty('--x', xMove)
		particle.style.setProperty('--y', yMove)

		particle.style.left = `${x}px`
		particle.style.top = `${y}px`
		particle.style.background = `hsl(${Math.random()*360}, 100%, 50%)`

		document.body.appendChild(particle)

		setTimeout(() => particle.remove(), 2000)
	}
}

export const enc = async function(data){
	let iv = crypto.getRandomValues(new Uint8Array(16))
	let encoder = new TextEncoder()
	let encodedData = encoder.encode(data)

	let keyBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(SCR))
	let cryptoKey = await crypto.subtle.importKey("raw", keyBuffer, { name: "AES-CBC" }, false, ["encrypt"])

	let encryptedBuffer = await crypto.subtle.encrypt({ name: "AES-CBC", iv: iv }, cryptoKey, encodedData)

	let encryptedBytes = new Uint8Array([...iv, ...new Uint8Array(encryptedBuffer)])
	return btoa(String.fromCharCode(...encryptedBytes))
}

export const dec = async function(encryptedBase64, key){
	let encryptedData = atob(encryptedBase64)
	let encryptedBytes = new Uint8Array(encryptedData.length)

	for (let i=0;i<encryptedData.length;i++){
		encryptedBytes[i] = encryptedData.charCodeAt(i)
	}

	let iv = encryptedBytes.slice(0, 16)
	let encryptedText = encryptedBytes.slice(16)

	let keyBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(key))
	let cryptoKey = await crypto.subtle.importKey("raw", keyBuffer, { name: "AES-CBC" }, false, ["decrypt"])

	let decryptedBuffer = await crypto.subtle.decrypt({ name: "AES-CBC", iv: iv }, cryptoKey, encryptedText)
	return new TextDecoder().decode(decryptedBuffer)
}

export const getRandomElements = async function(arr, num, excludeKeys = []){
	let filteredArr = arr.filter(item => !excludeKeys.includes(item))

	if (filteredArr.length <= num) return filteredArr

		let shuffled = filteredArr.slice()
	for(let i=shuffled.length-1;i>0;i--){
		let j=Math.floor(Math.random()*(i+1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
	}

	return shuffled.slice(0, num)
}

export const pageContentAdapter = async function(){
	const pageContentMain = BODY.querySelector('.page-content-main')
	const selectors = BODY.querySelectorAll('.selector ul')
	const windowHeight = window.innerHeight

	if(selectors){
		for(const selector of selectors){
			selector.style.cssText = `max-height:${windowHeight-150}px`
		}
	}

	if(pageContentMain){
		pageContentMain.style.cssText = `height:${windowHeight}px`
		pageContentMain.scrollTo(0, 0)
	}
}

export const sprintf = async function(template, ...values) {
	const keys = template.match(/{(\w+)}/g) || []
	return keys.reduce((str, key, index) => str.replace(key, values[index] || key), template)
}