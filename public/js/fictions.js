import {
	APP, GAME_POINTS, GAME_STRUCTURE, SCR,
	GAME_SOUNDS, GAME_SETTINGS, ALL_FLAGS, NORMAL_FLAGS, HARD_FLAGS
} from './defines.js?v=0.0.10'
import {
	pointsFormat, shuffle, enc, dec, getRandomElements, createFirework, alerty, pageContentAdapter
} from './funcs.js?v=0.0.03'
import Scenes from './scenes.js?v=0.0.10'

let addedStartGameEventListener = false
class Fictions{
	static async StartGame(){
		const newGameStructure = GAME_STRUCTURE
		let newMultiplier = GAME_STRUCTURE.game_multiplier
		let gameMultiplierDOM

		if(addedStartGameEventListener === false){

			const gameMultiplier = GAME_STRUCTURE.game_difficulty

			APP.addEventListener('click', async function(event){
				const target = event.target.closest('[data-struct]')

				if(target && !target.parentElement.classList.contains('active')){
					gameMultiplierDOM = APP.querySelector('#game-multiplier')

					const dataStruct = target.getAttribute('data-struct')
					const splitDataStruct = dataStruct.split('.')
					const dataStructKey = splitDataStruct[0]
					const dataStructVal = splitDataStruct[1]

					newGameStructure[dataStructKey] = dataStructVal

					const targetUL = target.parentElement.parentElement
					const targetSiblings = targetUL.querySelectorAll('li')

					let oldActivePoint = 0

					for(const targetSibling of targetSiblings){
						if(targetSibling.classList.contains('active')){
							targetSibling.classList.remove('active')
							oldActivePoint = GAME_POINTS[targetSibling.querySelector('a').getAttribute('data-struct').replace('.', '_')]
						}
					}

					newMultiplier = (GAME_POINTS[`${dataStructKey}_${dataStructVal}`] / oldActivePoint) * GAME_STRUCTURE.game_multiplier
					newGameStructure.game_multiplier = newMultiplier
					target.parentElement.classList.add('active')
				}

				if(gameMultiplierDOM){
					gameMultiplierDOM.textContent = await pointsFormat(newMultiplier)
				}

				addedStartGameEventListener = true
			})
		}
	}

	static async Game(game_flow = {}, game_structure = {}, shuffled_flags = {}){
		let videoElement
		let adsLoaded = false
		let adContainer
		let adDisplayContainer
		let adsLoader

		window.addEventListener('load', function(event){
			videoElement = document.getElementById('video-element')

			initializeIMA()

			videoElement.addEventListener('play', function(event){
				loadAds(event)
			})

			let playButton = APP.getElementById('continue-game-req')
			playButton.addEventListener('click', function(event){
				document.getElementById('video-container').classList.add('active')
				videoElement.play()
			})
		})

		window.addEventListener('resize', function(event){
			console.log("window resized")
			if(adsManager){
				let width = videoElement.clientWidth
				let height = videoElement.clientHeight
				adsManager.resize(width, height, google.ima.ViewMode.NORMAL)
			}
		})

		function initializeIMA(){
			console.log("initializing IMA")
			adContainer = document.getElementById('ad-container')
			adContainer.addEventListener('click', adContainerClick)
			adDisplayContainer = new google.ima.AdDisplayContainer(adContainer, videoElement)
			adsLoader = new google.ima.AdsLoader(adDisplayContainer)

			adsLoader.addEventListener(google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED, onAdsManagerLoaded, false)
			adsLoader.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, onAdError, false)

			videoElement.addEventListener('ended', function(){
				adsLoader.contentComplete()
			})

			let adsRequest = new google.ima.AdsRequest()

			adsRequest.adTagUrl = `https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/single_ad_samples&sz=640x480&cust_params=sample_ct%3Dlinear&ciu_szs=300x250%2C728x90&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&impl=s&correlator=`

			adsRequest.linearAdSlotWidth = videoElement.clientWidth
			adsRequest.linearAdSlotHeight = videoElement.clientHeight
			adsRequest.nonLinearAdSlotWidth = videoElement.clientWidth
			adsRequest.nonLinearAdSlotHeight = videoElement.clientHeight / 3

			adsLoader.requestAds(adsRequest)

			function adContainerClick(event){
				if(videoElement.paused){
					videoElement.play()
				}else{
					videoElement.pause()
				}
			}

			function onAdsManagerLoaded(adsManagerLoadedEvent){
				adsManager = adsManagerLoadedEvent.getAdsManager(videoElement)

				adsManager.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, onAdError)
				adsManager.addEventListener(google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED, onContentPauseRequested)
				adsManager.addEventListener(google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED, onContentResumeRequested)
				adsManager.addEventListener(google.ima.AdEvent.Type.LOADED, onAdLoaded)
				adsManager.addEventListener(google.ima.AdEvent.Type.COMPLETE, onAdCompleted)
			}

			function onAdError(adErrorEvent){
				console.log(adErrorEvent.getError())
				if(adsManager){
					adsManager.destroy()
				}
			}
		}

		function onAdLoaded(adEvent){
			let ad = adEvent.getAd()
			if(!ad.isLinear()){
				videoElement.play()
			}
		}

		function onContentPauseRequested(){
			videoElement.pause()
		}

		function onContentResumeRequested(){
			videoElement.play()
		}

		async function onAdCompleted(adEvent){
			document.getElementById('video-container').classList.remove('active')
			await continueGame()
		}

		function loadAds(event) {
			if(adsLoaded){
				return
			}

			adsLoaded = true

			event.preventDefault()

			console.log("loading ads")

			videoElement.load()
			adDisplayContainer.initialize()

			let width = videoElement.clientWidth
			let height = videoElement.clientHeight
			try{
				adsManager.init(width, height, google.ima.ViewMode.NORMAL)
				adsManager.start()
			}catch(adError){
				console.log("AdsManager could not be started");
				videoElement.play()
			}
		}


		let gameContinued = false

		let shuffledFlags

		const game_flow_obj = Object.keys(game_flow)
		const game_structure_obj = Object.keys(game_structure)

		let GAME_FLOW = {
			game_lap: 0,
			game_earned_points: 0,
			game_total_time: 0,
			game_continued: false,
			game_started_again: false,
			game_number_of_total_fault: 0
		}

		const currentFlagDOM = APP.querySelector('.current-flag')
		const pageContentDOM = APP.querySelector('.page-content')
		const gameOptionsULDOM = APP.querySelector('.game-middle-options-main ul')
		const gameTimerDOM = APP.querySelector('.game-top-timer')
		const gameTimerSPANDOM = APP.querySelector('.game-top-timer span')
		const gameHeartsDOM = APP.querySelector('.game-top-hearts ul')
		const gameTopPointsDOM = APP.querySelector('.game-top-points span span')

		if(game_flow_obj.length > 0 && game_structure_obj.length > 0){
			gameContinued = true
			shuffledFlags = shuffled_flags

			GAME_FLOW = game_flow
			GAME_FLOW.game_continued = true
			GAME_FLOW.game_started_again = true

			GAME_STRUCTURE.game_difficulty = game_structure.game_difficulty
			GAME_STRUCTURE.game_number_of_fault = 1
			GAME_STRUCTURE.game_options_amount = game_structure.game_options_amount
			GAME_STRUCTURE.game_multiplier = game_structure.game_multiplier

			gameTopPointsDOM.textContent = await pointsFormat(GAME_FLOW.game_earned_points)
		}

		let gameDifficulty = GAME_STRUCTURE.game_difficulty
		let gameOptionsAmount = GAME_STRUCTURE.game_options_amount
		let gameNumberofFault = GAME_STRUCTURE.game_number_of_fault
		let gameMultiplier = GAME_STRUCTURE.game_multiplier

		let gameLapTime = GAME_SETTINGS.game_lap_time
		let gamePointsPerFlag = GAME_SETTINGS.game_points_per_flag

		let criticalRemainingTime = 3

		if(gameContinued === false){
			if(gameDifficulty === 'hard'){
				shuffledFlags = await shuffle(ALL_FLAGS)
			}else if(gameDifficulty === 'normal'){
				shuffledFlags = await shuffle(NORMAL_FLAGS)
			}
		}

		const beReady = async function(){
			const beReadyTheme = `
				<div class="reminder-full">
					<span>${l.be_ready}</span>
				</div>
			`

			APP.insertAdjacentHTML('afterbegin', beReadyTheme)
		}

		let beReadyDelay = 3000

		let gameStartedAudio = new Audio(GAME_SOUNDS.game_started.src)
		let soundOnAudio = new Audio(GAME_SOUNDS.sound_on.src)
		let tickingAudio = new Audio(GAME_SOUNDS.ticking.src)
		let faultAudio = new Audio(GAME_SOUNDS.fault.src)
		let correctAudio = new Audio(GAME_SOUNDS.correct.src)
		let gameEndedAudio = new Audio(GAME_SOUNDS.game_ended.src)
		let gamePausedAudio = new Audio(GAME_SOUNDS.game_paused.src)

		const pauseAllAudios = async function(){
			gameStartedAudio.pause()
			gameStartedAudio.currentTime = 0
			soundOnAudio.pause()
			soundOnAudio.currentTime = 0
			tickingAudio.pause()
			tickingAudio.currentTime = 0
			faultAudio.pause()
			faultAudio.currentTime = 0
			correctAudio.pause()
			correctAudio.currentTime = 0
			gameEndedAudio.pause()
			gameEndedAudio.currentTime = 0
			gamePausedAudio.pause()
			gamePausedAudio.currentTime = 0
		}

		const soundStorage = localStorage.getItem('sound')
		GAME_SETTINGS.game_sound = soundStorage !== null ? soundStorage : GAME_SETTINGS.game_sound

		const gameStartedAudioOn = async function(){
			if(GAME_SETTINGS.game_sound === 'off') return
				await pauseAllAudios()
			gameStartedAudio.play()
			gameStartedAudio.volume = GAME_SOUNDS.game_started.volume
		}

		const gameEndedAudioOn = async function(){
			if(GAME_SETTINGS.game_sound === 'off') return
				await pauseAllAudios()
			gameEndedAudio.play()
			gameEndedAudio.volume = GAME_SOUNDS.game_ended.volume
		}

		const gamePausedAudioOn = async function(){
			if(GAME_SETTINGS.game_sound === 'off') return
				await pauseAllAudios()
			gamePausedAudio.play()
			gamePausedAudio.volume = GAME_SOUNDS.game_paused.volume
		}

		const tickingAudioOn = async function(){
			if(GAME_SETTINGS.game_sound === 'off') return
				await pauseAllAudios()
			tickingAudio.play()
			tickingAudio.loop = true
			tickingAudio.volume = GAME_SOUNDS.ticking.volume
		}

		const tickingAudioOff = async function(){
			tickingAudio.currentTime = 0
			tickingAudio.pause()
		}

		const faultSoundOn = async function(){
			if(GAME_SETTINGS.game_sound === 'off') return
				await pauseAllAudios()
			faultAudio.play()
			faultAudio.volume = GAME_SOUNDS.fault.volume
		}

		const soundOn = async function(){
			await pauseAllAudios()
			if(GAME_SETTINGS.game_sound !== 'off') return
				soundOnAudio.play()
			soundOnAudio.volume = GAME_SOUNDS.sound_on.volume
		}

		const correctAudioOn = async function(){
			if(GAME_SETTINGS.game_sound === 'off') return
				await pauseAllAudios()
			correctAudio.play()
			correctAudio.volume = GAME_SOUNDS.correct.volume
		}

		const gameStarted = async function(){
			await beReady()

			setTimeout(async function(){
				const reminderFullDOM = APP.querySelector('.reminder-full')

				if(reminderFullDOM){
					reminderFullDOM.remove()
				}

				await gameStartedAudioOn()
				await generalTimer()

			}, beReadyDelay)
		}

		let criticalTime = false
		let timerInterval
		let generalTimerInterval
		const userFault = async function(countFaults = true){
			gameNumberofFault--

			if(countFaults === true){
				GAME_FLOW.game_number_of_total_fault += 1
			}

			const heartElements = gameHeartsDOM.querySelectorAll('li')
			for(const heartElement of heartElements){
				if(!heartElement.classList.contains('lost')){
					const brokenHeartImage = new Image()
					brokenHeartImage.src = `../public/img/icons/broken-heart.svg`

					const lostHeartImage = new Image()
					lostHeartImage.src = `../public/img/icons/lost-heart.svg`

					const elementImage = heartElement.querySelector('img')

					heartElement.classList.add('broking')
					elementImage.src = brokenHeartImage.src

					setTimeout(async function(){
						elementImage.src = lostHeartImage.src
						heartElement.classList.remove('broking')
						heartElement.classList.add('lost')
					}, 500)

					await faultSoundOn()
					
					if(gameNumberofFault === 0){
						// if(false){
						// 	if(GAME_FLOW.game_started_again === false){
						// 		await gamePaused()
						// 	}else{
						// 		await gameEnded()
						// 	}
						// }else{
						// 	await gameEnded()
						// }

						await gamePaused()
					}

					break
				}
			}
		}

		const gamePaused = async function(){
			APP.removeEventListener('click', selectOptionHandler)
			APP.removeEventListener('click', soundToggleHandler)

			setTimeout(async function(){
				clearInterval(generalTimerInterval)

				setTimeout(async function(){
					await gamePausedAudioOn()
				}, 500)

				APP.innerHTML = await Scenes.GamePaused(GAME_FLOW, GAME_STRUCTURE)

				APP.addEventListener('click', continueGameReq)
				APP.addEventListener('click', continueGameEnd)
			}, 1000)
		}

		const continueGameReq = async function(){
			const target = event.target.closest('#continue-game-req')

			if(target){
				APP.removeEventListener('click', continueGameReq)
				APP.removeEventListener('click', continueGameEnd)

			}
		}

		const continueGameEnd = async function(){
			const target = event.target.closest('#continue-game-end')

			if(target){
				APP.removeEventListener('click', continueGameReq)
				APP.removeEventListener('click', continueGameEnd)
				await gameEnded(50, 100)
			}
		}

		const continueGame = async function(){
			APP.innerHTML = await Scenes['Game'](1)

			await pageContentAdapter()
			const fictionFunc = Fictions['Game']
			if(fictionFunc){
				await fictionFunc(GAME_FLOW, GAME_STRUCTURE, shuffledFlags)
			}
		}

		const gameEnded = async function(soundTime = 500, time = 1000){
			APP.removeEventListener('click', selectOptionHandler)
			APP.removeEventListener('click', soundToggleHandler)

			setTimeout(async function(){
				clearInterval(generalTimerInterval)

				setTimeout(async function(){
					await gameEndedAudioOn()
				}, soundTime)

				APP.innerHTML = await Scenes.GameEnded(GAME_FLOW, GAME_STRUCTURE)

				const userStatisticsPointsDOM = APP.querySelector('.user-statistics-points')
				await createFirework(userStatisticsPointsDOM)
			}, time)
		}

		const userCorrect = async function(element){
			await correctAudioOn()
			element.classList.add('correct')
			await userEarnedPoints(element)
		}

		const userEarnedPoints = async function(element){
			const lapPoints = gamePointsPerFlag*gameMultiplier
			GAME_FLOW.game_earned_points += lapPoints

			gameTopPointsDOM.textContent = await pointsFormat(GAME_FLOW.game_earned_points)
			await miniAlerty(element, lapPoints)
		}

		const timer = async function(){
			gameTimerSPANDOM.textContent = gameLapTime

			timerInterval = setInterval(async function(){
				gameLapTime--
				gameTimerSPANDOM.textContent = (gameLapTime <= 0 ? 0 : gameLapTime)

				if(gameLapTime <= criticalRemainingTime && criticalTime === false){
					gameTimerDOM.classList.add('hurry-up')

					await tickingAudioOn()

					criticalTime = true
				}else if(gameLapTime === 0){
					await userFault()
					setTimeout(async function(){
						await nextLap()
					}, 1000)
				}
			}, 1000)
		}

		const generalTimer = async function(){
			generalTimerInterval = setInterval(async function(){
				GAME_FLOW.game_total_time += 1
			}, 1000)

		}

		const refreshTime = async function(){
			gameLapTime = GAME_SETTINGS.game_lap_time
			gameTimerDOM.classList.remove('hurry-up')
			criticalTime = false
			await tickingAudioOff()
		}

		const endTime = async function(){
			clearInterval(timerInterval)
			gameTimerSPANDOM.textContent = 0
			gameLapTime = 0
			gameTimerDOM.classList.remove('hurry-up')
			criticalTime = false
			await tickingAudioOff()
		}

		let currentFlag
		let correctFlagIndex
		let isFlagHard = false
		const nextLap = async function(){
			if(gameNumberofFault !== 0){

				await refreshTime()

				const nextLapFlagCode = shuffledFlags[GAME_FLOW.game_lap+1]
				if(nextLapFlagCode && nextLapFlagCode !== undefined){
					const nextLabFlagImg = new Image()
					nextLabFlagImg.src = `../public/img/flags/${shuffledFlags[GAME_FLOW.game_lap+1]}.svg`
				}

				const flagCode = shuffledFlags[GAME_FLOW.game_lap]
				isFlagHard = HARD_FLAGS.filter((key, val) => key === flagCode).length > 0 ? true : false

				currentFlag = flagCode

				if(flagCode && flagCode !== undefined){
					currentFlagDOM.innerHTML = `<img alt="${flagCode}" class="flag-in" src="../public/img/flags/${flagCode}.svg" width="100%" />`

					let options = []
					let wrongOptions = []

					const wrongOptionsAmount = gameOptionsAmount-1
					if(gameDifficulty === 'normal'){
						wrongOptions = await getRandomElements(NORMAL_FLAGS, wrongOptionsAmount, [flagCode])
					}else if(gameDifficulty === 'hard'){
						const hardOptionsAmount = gameOptionsAmount/2
						const wrongHardOptions = await getRandomElements(HARD_FLAGS, hardOptionsAmount, [flagCode])
						if(gameOptionsAmount > 2){
							const normalOptionsAmount = hardOptionsAmount-1
							const wrongNormalOptions = await getRandomElements(NORMAL_FLAGS, normalOptionsAmount, [flagCode])
							wrongOptions = wrongHardOptions.concat(wrongNormalOptions)
						}else{
							wrongOptions = await getRandomElements(HARD_FLAGS, 1, [flagCode])
						}
					}

					options = wrongOptions
					options.push(flagCode)
					options = await shuffle(options)

					let optionsTheme = ''

					for(let i=0;i<gameOptionsAmount;i++){
						let optionFlagCode = options[i]

						if(optionFlagCode === currentFlag){
							correctFlagIndex = i
						}

						const dataOption = await enc(optionFlagCode)
						optionsTheme += `<li><a data-option="${dataOption}" href="javascript:;">${c[optionFlagCode]}</a></li>`
					}

					gameOptionsULDOM.innerHTML = optionsTheme

					GAME_FLOW.game_lap += 1
				}else{
					await gameEnded()
				}

				clearInterval(timerInterval)

				if(GAME_FLOW.game_lap === 1 || GAME_FLOW.game_continued === true){
					setTimeout(async function(){
						await timer()
						GAME_FLOW.game_continued = false
					}, beReadyDelay)
				}else{
					await timer()
				}
			}else{
				await endTime()
				await userFault(false)
			}
		}


		const miniAlerty = async function(element, point){
			const alertyTheme = `
				<div class="mini-alerty">${isFlagHard ? `(${l.hard})` : ''} +${await pointsFormat(point)}</div>
			`

			element.insertAdjacentHTML('afterbegin', alertyTheme)
		}

		const selectOptionHandler = async function(event){
			const target = event.target.closest('[data-option]')

			const gameOptionsULLIDOMS = APP.querySelectorAll('.game-middle-options-main ul li')

			if(target){
				const targetLIDOM = target.parentElement
				const dataOption = target.getAttribute('data-option')
				const choosenOptionFlagCode = await dec(dataOption, SCR)

				clearInterval(timerInterval)

				for(const gameOptionElement of gameOptionsULLIDOMS){
					gameOptionElement.classList.add('passive')
				}

				if(choosenOptionFlagCode === currentFlag){
					await userCorrect(targetLIDOM)
				}else{
					const correctOptionLIDOM = gameOptionsULLIDOMS[correctFlagIndex]

					await userFault()
					targetLIDOM.classList.add('fault')
					correctOptionLIDOM.classList.add('correct')
				}

				setTimeout(async function(){
					await nextLap()
				}, 1000)
			}
		}

		const soundToggleHandler = async function(event){
			const target = event.target.closest('[data-sound-toggle]')
			if(target){
				const targetAttr = target.getAttribute('data-sound-toggle')
				const targetIMGDOM = target.querySelector('img')

				await soundOn()

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
				GAME_SETTINGS.game_sound = targetAttr
			}
		}

		APP.addEventListener('click', selectOptionHandler)
		APP.addEventListener('click', soundToggleHandler)

		await gameStarted()
		await nextLap()
	}
}

export default Fictions