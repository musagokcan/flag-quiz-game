import {pointsFormat, shuffle, timeFormat, getLeaders, saveScore, contact, sprintf} from './funcs.js?v=0.0.10'
import {GAME_POINTS, GAME_STRUCTURE, GAME_SETTINGS, ACTIVE_LANGUAGES} from './defines.js?v=0.0.10'

class Scenes{
	static Welcome(){
		const activeLanguage = ACTIVE_LANGUAGES[_LANG]
		const languagesCount = Object.keys(ACTIVE_LANGUAGES).length

		let languagesTheme = ''
		if(languagesCount > 0){
			for(const language of Object.values(ACTIVE_LANGUAGES)){
				languagesTheme += `
					<li class="${activeLanguage.code === language.code ? 'active' : ''}"><a href="${_SERVER}${language.code}/" ${language.dir === 'rtl' ? 'dir="rtl"' : 'dir="ltr"'}><img alt="${language.code}" loading="lazy" src="../comm/locales/flags/${language.code}.svg" width="25" />${language.title}</a></li>
				`
			}
		}

		return `
			<div class="selector-main page-in">
				<div class="container">
					<div class="row">
						<div class="col-12">
							<div class="selector-group">
								<div class="selector left">
									<div class="active-select hvr">
										<a href="javascript:;" data-dr-target="languages"><img loading="lazy" alt="${activeLanguage.code}" src="../comm/locales/flags/${activeLanguage.code}.svg" width="27" />${activeLanguage.title}</a>
									</div>
									<ul data-dr="languages">${languagesTheme}</ul>
								</div>
								<div class="selector right">
									<div class="active-select">
										<a href="javascript:;" data-dr-target="policies"><img  alt="menu" src="../public/img/icons/menu.svg" width="25" /></a>
									</div>
									<ul data-dr="policies">
										<li><a href="javascript:;"><img alt="privacy-policy" src="../public/img/icons/right-arrow${activeLanguage.dir === 'rtl' ? '-rtl' : ''}.svg" width="12" />${l.privacy_policy_title}</a></li>
										<li><a href="javascript:;"><img alt="cookie-policy" src="../public/img/icons/right-arrow${activeLanguage.dir === 'rtl' ? '-rtl' : ''}.svg" width="12" />${l.cookie_policy_title}</a></li>
										<li><a href="javascript:;"><img alt="terms-of-use" src="../public/img/icons/right-arrow${activeLanguage.dir === 'rtl' ? '-rtl' : ''}.svg" width="12" />${l.terms_of_use_title}</a></li>
										<li><a href="javascript:;"><img alt="gdpr" src="../public/img/icons/right-arrow${activeLanguage.dir === 'rtl' ? '-rtl' : ''}.svg" width="12" />${l.gdpr_title}</a></li>
									</ul>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="container">
				<div class="row">
					<div class="col-12">
						<div class="main-menu page-in">
							<div class="main-menu-logo">
								<a href="${_SERVER}${_LANG}/">dyroid</a>
								<h1>${l.main_title}</h1>
							</div>
							<ul class="${activeLanguage.dir === 'rtl' ? 'rtl' : ''}">
								<li>
									<a href="javascript:;" data-f="StartGame">
										<img alt="start-game" src="../public/img/icons/play.svg" />
										<span>${l.start_game}</span>
									</a>
								</li>
								<li>
									<a href="javascript:;">
										<img alt="leaderboard" src="../public/img/icons/leaderboard.svg" />
										<span>${l.leaderboard}</span>
									</a>
								</li>
								<hr>
								<li class="sm">
									<a href="javascript:;" data-f="HowtoPlay">
										<span>${l.how_to_play_title}</span>
									</a>
								</li>
								<li class="sm">
									<a href="javascript:;" data-f="Contact">
										<span>${l.contact_title}</span>
									</a>
								</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		`
	}

	static async StartGame(){
		const activeLanguage = ACTIVE_LANGUAGES[_LANG]
		const gameMultiplier = Number(GAME_STRUCTURE.game_multiplier).toFixed(2)
		const gameDifficulty = GAME_STRUCTURE.game_difficulty
		const gameNumberofFault = parseInt(GAME_STRUCTURE.game_number_of_fault)
		const gameOptionsAmount = parseInt(GAME_STRUCTURE.game_options_amount)

		return `
			<div class="page-content-main page-in">
				<div class="container-fluid">
					<div class="row">
						<div class="col-12 col-md-6 offset-md-3${activeLanguage.dir === 'rtl' ? '-r' : ''}">
							<div class="page-content">
								<h2><img alt="settings" src="../public/img/icons/settings.svg" width="27" /> <span>${l.game_settings}</span></h2>
								<div class="page-form mt-4">
									<div class="form-group">
										<label><img alt="difficulty" src="../public/img/icons/difficulty.svg" width="18" />${l.game_difficulty}</label>
										<div class="form-options">
											<ul>
												<li class="${gameDifficulty === 'normal' ? 'active' : ''}">
													<a data-struct="game_difficulty.normal" href="javascript:;">
														<span>${l.game_difficulty_normal}</span>
														<p>x${await pointsFormat(GAME_POINTS.game_difficulty_normal)} p</p>
													</a>
												</li>
												<li class="${gameDifficulty === 'hard' ? 'active' : ''}">
													<a data-struct="game_difficulty.hard" href="javascript:;">
														<span>${l.game_difficulty_hard}</span>
														<p>x${await pointsFormat(GAME_POINTS.game_difficulty_hard)} p</p>
													</a>
												</li>
											</ul>
										</div>
									</div>
									<div class="form-group">
										<label><img alt="heart" src="../public/img/icons/heart.svg" width="18" />${l.game_number_of_fault}</label>
										<div class="form-options">
											<ul>
												<li class="${gameNumberofFault === 1 ? 'active' : ''}">
													<a data-struct="game_number_of_fault.1" href="javascript:;">
														<span>1</span>
														<p>x${await pointsFormat(GAME_POINTS.game_number_of_fault_1)} p</p>
													</a>
												</li>
												<li class="${gameNumberofFault === 3 ? 'active' : ''}">
													<a data-struct="game_number_of_fault.3" href="javascript:;">
														<span>3</span>
														<p>x${await pointsFormat(GAME_POINTS.game_number_of_fault_3)} p</p>
													</a>
												</li>
												<li class="${gameNumberofFault === 5 ? 'active' : ''}">
													<a data-struct="game_number_of_fault.5" href="javascript:;">
														<span>5</span>
														<p>x${await pointsFormat(GAME_POINTS.game_number_of_fault_5)} p</p>
													</a>
												</li>
											</ul>
										</div>
									</div>
									<div class="form-group">
										<label><img alt="options" src="../public/img/icons/options.svg" width="18" />${l.game_options_amount}</label>
										<div class="form-options">
											<ul>
												<li class="${gameOptionsAmount === 2 ? 'active' : ''}">
													<a data-struct="game_options_amount.2" href="javascript:;">
														<span>2</span>
														<p>x${await pointsFormat(GAME_POINTS.game_options_amount_2)} p</p>
													</a>
												</li>
												<li class="${gameOptionsAmount === 4 ? 'active' : ''}">
													<a data-struct="game_options_amount.4" href="javascript:;">
														<span>4</span>
														<p>x${await pointsFormat(GAME_POINTS.game_options_amount_4)} p</p>
													</a>
												</li>
												<li class="${gameOptionsAmount === 6 ? 'active' : ''}">
													<a data-struct="game_options_amount.6" href="javascript:;">
														<span>6</span>
														<p>x${await pointsFormat(GAME_POINTS.game_options_amount_6)} p</p>
													</a>
												</li>
											</ul>
										</div>
									</div>
									<div class="form-group mb-3">
										<div class="checkbox">
											<input id="fullscreen-mode" type="checkbox" />
											<label for="fullscreen-mode">
												<div class="left">
													<img alt="check" src="../public/img/icons/check.svg" class="d-none" />
												</div>
												<div class="right">
													<span>${l.full_screen_mode_title}</span>
													<p>${l.full_screen_mode_desc}</p>
												</div>
											</label>
										</div>
									</div>
									<div class="form-group">
										<a href="javascript:;" data-f="Game" class="start-game">
											<span><img alt="start-game" src="../public/img/icons/play.svg" /> ${l.start_game}</span>
											<p>${l.multiplier_title} <span>x<span id="game-multiplier">${gameMultiplier}</span> p</span></p>
										</a>
									</div>
									<div class="form-group">
										<a href="javascript:;" data-f="Welcome" class="go-back">
											<span><img alt="go-back" src="../public/img/icons/back.svg" width="17" /> ${l.go_back}</span>
										</a>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		`
	}

	static async Game(game_number_of_fault = false){
		const activeLanguage = ACTIVE_LANGUAGES[_LANG]

		let heartsTheme = ''
		let gameNumberofFault = game_number_of_fault || GAME_STRUCTURE.game_number_of_fault
		for(let i=0;i<parseInt(gameNumberofFault);i++){
			heartsTheme += `<li><img alt="red-heart" src="../public/img/icons/red-heart.svg" /></li>`
		}

		const soundStorage = localStorage.getItem('sound')
		const soundStatus = soundStorage !== null ? soundStorage : GAME_SETTINGS.game_sound

		return `
			<div class="page-content-main in-game page-in">
				<div class="container-fluid">
					<div class="row">
						<div class="col-12 col-md-10 offset-md-1${activeLanguage.dir === 'rtl' ? '-r' : ''}">
							<div class="page-content">
								<div class="game-top-main mb-5">
									<div class="game-top-points">
										<span>${await sprintf(l.points, '<span>0.00</span>')}</span>
										<p>x${await pointsFormat(GAME_STRUCTURE.game_multiplier)} p</p>
									</div>
									<div class="game-top-timer">
										<span>${GAME_SETTINGS.game_lap_time}</span>
									</div>
									<div class="game-top-hearts">
										<div class="game-top-sound">
											<a href="javascript:;" data-sound-toggle="${soundStatus === 'off' ? 'on' : 'off'}"><img alt="sound-toggle" src="../public/img/icons/sound-${soundStatus === 'on' ? 'on' : 'off'}.svg" width="18" /></a>
										</div>
										<ul>${heartsTheme}</ul>
									</div>
								</div>

								<div class="game-middle-main">
									<div class="row">
										<div class="col-8 offset-2${activeLanguage.dir === 'rtl' ? '-r' : ''} col-md-4 offset-md-4${activeLanguage.dir === 'rtl' ? '-r' : ''}">
											<div class="row">
												<div class="col-12 col-md-8 offset-md-2${activeLanguage.dir === 'rtl' ? '-r' : ''}">
													<div class="game-middle-top-main">
														<div class="current-flag"></div>
													</div>
												</div>
											</div>
										</div>
										<div class="col-12 col-md-6 offset-md-3${activeLanguage.dir === 'rtl' ? '-r' : ''}">
											<div class="game-middle-bottom-main mt-5">
												<div class="game-middle-options-main">
													<ul></ul>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		`
	}

	static async GameEnded(GAME_FLOW, GAME_STRUCTURE){
		const activeLanguage = ACTIVE_LANGUAGES[_LANG]

		localStorage.setItem('GAME_FLOW', JSON.stringify(GAME_FLOW))
		localStorage.setItem('GAME_STRUCTURE', JSON.stringify(GAME_STRUCTURE))

		const gameEarnedPoints = GAME_FLOW.game_earned_points
		const gameTotalTime = GAME_FLOW.game_total_time
		const gameTotalTimeFormat = await timeFormat(GAME_FLOW.game_total_time)
		const gameNumberofFault = GAME_FLOW.game_number_of_total_fault
		const gameLapsAmount = GAME_FLOW.game_lap

		const gameMultiplier = GAME_STRUCTURE.game_multiplier
		const gameDifficulty = (GAME_STRUCTURE.game_difficulty === 'normal' ? l.game_difficulty_normal : l.game_difficulty_hard)
		const gameOptionsAmount = GAME_STRUCTURE.game_options_amount

		const canSavetheScore = (gameEarnedPoints >= 100 && gameTotalTime >= 60)

		return `
			<div class="page-content-main page-in">
				<div class="container-fluid">
					<div class="row">
						<div class="col-12 col-md-6 offset-md-3${activeLanguage.dir === 'rtl' ? '-r' : ''}">
							<div class="page-content">
								<div class="user-statistics-title">
									<h2>${l.game_ended}</h2>
									<div class="user-statistics-points">
										<div class="user-points">${await sprintf(l.points, await pointsFormat(gameEarnedPoints))}</div>
										<div class="game-multiplier">x${await sprintf(l.multiplier, await pointsFormat(gameMultiplier))}</div>
									</div>
								</div>
								<div class="user-statistics-main mt-5">
									<ul>
										<li><span>${l.game_difficulty}</span><b>${gameDifficulty}</b></li>
										<li><span>${l.game_number_of_fault}</span><b>${gameNumberofFault}</b></li>
										<li><span>${l.game_options_amount}</span><b>${gameOptionsAmount}</b></li>
										<li><span>${l.spent_time}</span><b>${gameTotalTimeFormat}</b></li>
										<li><span>${l.laps_amount}</span><b>${await sprintf(l.lap, gameLapsAmount)}</b></li>
									</ul>
								</div>
								<div class="user-statistics-buttons mt-2">
									<div class="form-group">
										<a href="javascript:;" data-f="Game" class="start-game">
											<span><img alt="play-again" src="../public/img/icons/play.svg" /> ${l.play_again}</span>
										</a>
									</div>
									<div class="form-group ${!canSavetheScore ? 'd-none' : ''}">
										<a href="javascript:;" data-f="SaveScore" class="save-score">
											<span><img alt="save-score" src="../public/img/icons/save.svg" /> ${l.save_score}</span>
										</a>
									</div>
									<div class="form-group">
										<a href="javascript:;" data-f="Welcome" class="go-back">
											<span><img alt="go-back" src="../public/img/icons/back.svg" width="17" /> ${l.go_back}</span>
										</a>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		`
	}

	static async GamePaused(){
		const activeLanguage = ACTIVE_LANGUAGES[_LANG]

		return `
			<div class="page-content-main page-in">
				<div class="container-fluid">
					<div class="row">
						<div class="col-12 col-md-6 offset-md-3${activeLanguage.dir === 'rtl' ? '-r' : ''}">
							<div class="page-content">
								<div class="user-statistics-title">
									<h2>${l.lives_are_over}</h2>
									<p>${l.return_the_game}</p>
								</div>
								<div class="form-group mt-5">
									<div class="form-group">
										<a href="javascript:;" id="continue-game-req-" class="ads">
											<span><img alt="start-game" src="../public/img/icons/ads.svg" /> ${l.watch_ad}</span>
										</a>
									</div>
									<div class="form-group">
										<a href="javascript:;" id="continue-game-end" class="go-back">
											<span><img alt="go-back" src="../public/img/icons/back.svg" width="17" /> ${l.end_game}</span>
										</a>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		`
	}

	static async LeaderBoard(){
		const activeLanguage = ACTIVE_LANGUAGES[_LANG]

		const countryLeaders = await getLeaders(true)
		const globalLeaders = await getLeaders()

		const countryLeadersResults = countryLeaders.result
		const globalLeadersResults = globalLeaders.result

		let countryLeaderBoardTheme = ''
		let globalLeaderBoardTheme = ''

		const ownerStorage = localStorage.getItem('lb_id') !== null ? parseFloat(localStorage.getItem('lb_id')) : false
		const leaderElementTemplate = async function(countryLeaderIndex, countryLeader){
			const ownerRank = (countryLeader && countryLeader.lb_rank) ? countryLeader.lb_rank : false
			const isOwner = (ownerStorage !== false  && countryLeader.lb_id === ownerStorage) ? true : false

			const leaderRank = ownerRank !== false ? ownerRank : countryLeaderIndex

			return `
				<li class="${isOwner ? 'owner' : ''} ${(leaderRank > 3 && isOwner) ? 'owner-scale' : ''}">
					<div class="leader-order"><span>${leaderRank}</span></div>
					<div class="leader-item-left">
						<div class="leader-flag"><img alt="${countryLeader.lb_owner_language}" src="../comm/locales/flags/${countryLeader.lb_owner_language}.svg" width="20px" /></div>
						<div class="leader-owner">${countryLeader.lb_owner}</div>
					</div>
					<div class="leader-item-right">
						<div class="leader-points"><span>${await pointsFormat(countryLeader.lb_points)}</span></div>
						<div class="leader-multiplier"><span>x${await pointsFormat(countryLeader.lb_multiplier)} p</span></div>
					</div>
				</li>
			`
		}

		const leaderEmptyTemplate = async function(){
			return `
				<div class="no-record-leaderboard mt-4 mb-3">
					<img alt="no-record" src="../public/img/icons/no-record.svg" />
					<span>${l.no_record}</span>
				</div>
			`
		}

		let globalTabActive = false

		if(countryLeadersResults.length > 0){
			let countryLeaderIndex = 1
			for(const countryLeader of countryLeadersResults){
				countryLeaderBoardTheme += await leaderElementTemplate(countryLeaderIndex, countryLeader)
				countryLeaderIndex++
			}

			countryLeaderBoardTheme = `<ul>${countryLeaderBoardTheme}</ul>`
		}else{
			countryLeaderBoardTheme = await leaderEmptyTemplate()
			globalTabActive = true
		}

		if(globalLeadersResults.length > 0){
			let globalLeaderIndex = 1
			for(const globalLeader of globalLeadersResults){
				globalLeaderBoardTheme += await leaderElementTemplate(globalLeaderIndex, globalLeader)
				globalLeaderIndex++
			}
			
			globalLeaderBoardTheme = `<ul>${globalLeaderBoardTheme}</ul>`
		}else{
			countryLeaderBoardTheme = await leaderEmptyTemplate()
		}

		const languageTitle = activeLanguage.title.toLocaleUpperCase(_LANG || 'und')
		return `
			<div class="page-content-main page-in">
				<div class="container-fluid">
					<div class="row">
						<div class="col-12 col-md-6 offset-md-3${activeLanguage.dir === 'rtl' ? '-r' : ''}">
							<div class="page-content">
								<h2><img alt="leaderboard" src="../public/img/icons/leaderboard.svg" width="27" /> <span>${l.leaderboard}</span></h2>
								<div class="page-form mt-4">
									<div class="leaderboard-main">
										<div class="leaderboard-tabs">
											<ul>
												<li class="country-tab ${!globalTabActive ? 'active' : ''}"><a data-target="country" href="javascript:;"><img alt="${activeLanguage.code}" src="../comm/locales/flags/${activeLanguage.code}.svg" /><span>${languageTitle}</span></a></li>
												<li class="global-tab ${globalTabActive ? 'active' : ''}"><a data-target="global" href="javascript:;"><img alt="global" src="../public/img/icons/global-${globalTabActive ? 'active' : 'passive'}.svg" /><span>${l.global}</span></a></li>
											</ul>
										</div>
										<div class="leaderboard-contents">
											<div data-tab="country" class="leaderboard-content leaderboard-country ${!globalTabActive ? 'active' : ''}">
												${countryLeaderBoardTheme}
											</div>
											<div data-tab="global" class="leaderboard-content leaderboard-global ${globalTabActive ? 'active' : ''}">
												${globalLeaderBoardTheme}
											</div>
										</div>
									</div>
									<div class="form-group">
										<a href="javascript:;" data-f="Welcome" class="go-back">
											<span><img alt="go-back" src="../public/img/icons/back.svg" width="17" /> ${l.go_back}</span>
										</a>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		`
	}

	static async HowtoPlay(){
		const activeLanguage = ACTIVE_LANGUAGES[_LANG]

		return `
			<div class="page-content-main page-in">
				<div class="container-fluid">
					<div class="row">
						<div class="col-12 col-md-6 offset-md-3${activeLanguage.dir === 'rtl' ? '-r' : ''}">
							<div class="page-content">
								<div class="close-page ${activeLanguage.dir === 'rtl' ? 'rtl' : ''}"><a href="javascript:;" data-f="Welcome"><img alt="close" src="../public/img/icons/close.svg" width="23" /></a></div>
								<h2><img alt="how-to-play" src="../public/img/icons/how-to-play.svg" width="27" /> <span>${l.how_to_play_title}</span></h2>
								<div class="mt-4 text-content">
									${l.how_to_play}
								</div>
								<div class="form-group mt-5">
									<a href="javascript:;" data-f="Welcome" class="go-back">
										<span><img alt="go-back" src="../public/img/icons/back.svg" width="17" /> ${l.go_back}</span>
									</a>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		`
	}

	static async SaveScore(){
		const activeLanguage = ACTIVE_LANGUAGES[_LANG]

		await saveScore()

		return `
			<div class="page-content-main page-in">
				<div class="container-fluid">
					<div class="row">
						<div class="col-12 col-md-6 offset-md-3${activeLanguage.dir === 'rtl' ? '-r' : ''}">
							<div class="page-content">
								<div class="close-page ${activeLanguage.dir === 'rtl' ? 'rtl' : ''}"><a href="javascript:;" data-f="Welcome"><img alt="close" src="../public/img/icons/close.svg" width="23" /></a></div>
								<h2><img alt="save-score" src="../public/img/icons/save.svg" width="27" /> <span>${l.save_score}</span></h2>
								<div class="mt-4 text-content">
									<div class="page-form mt-4">
										<div class="form-group">
											<input type="text" id="score_owner" autocomplete="off" placeholder="${l.score_owner}" />
										</div>
										<div class="form-group">
											<a href="javascript:;" class="save-score" id="saveScore">
												<span><img alt="save-score" src="../public/img/icons/save.svg" /> ${l.save}</span>
											</a>
										</div>
									</div>
								</div>
								<div class="form-group mt-5">
									<a href="javascript:;" data-f="Welcome" class="go-back">
										<span><img alt="go-back" src="../public/img/icons/back.svg" width="17" /> ${l.go_back}</span>
									</a>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		`
	}

	static async Contact(){
		const activeLanguage = ACTIVE_LANGUAGES[_LANG]

		await contact()

		return `
			<div class="page-content-main page-in">
				<div class="container-fluid">
					<div class="row">
						<div class="col-12 col-md-6 offset-md-3${activeLanguage.dir === 'rtl' ? '-r' : ''}">
							<div class="page-content">
								<div class="close-page ${activeLanguage.dir === 'rtl' ? 'rtl' : ''}"><a href="javascript:;" data-f="Welcome"><img alt="close" src="../public/img/icons/close.svg" width="23" /></a></div>
								<h2><img alt="save" src="../public/img/icons/save.svg" width="27" /> <span>${l.contact_title}</span></h2>
								<div class="mt-4 text-content">
									<div class="page-form mt-4">
										<div class="form-group">
											<input type="email" id="contact_email" autocomplete="off" placeholder="${l.email_address}" />
										</div>
										<div class="form-group">
											<textarea rows="5" id="contact_message" placeholder="${l.message}"></textarea>
										</div>
										<div class="form-group">
											<a href="javascript:;" class="save-score" id="contact">
												<span><img alt="send" src="../public/img/icons/save.svg" /> ${l.send}</span>
											</a>
										</div>
									</div>
								</div>
								<div class="form-group mt-5">
									<a href="javascript:;" data-f="Welcome" class="go-back">
										<span><img alt="go-back" src="../public/img/icons/back.svg" width="17" /> ${l.go_back}</span>
									</a>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		`
	}
}

export default Scenes