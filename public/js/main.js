import {APP} from './defines.js?v=0.0.10'
import {preload, pageContentAdapter, topFlags, version} from './funcs.js?v=0.0.10'
import Scenes from './scenes.js?v=0.0.10'
import Fictions from './fictions.js?v=0.0.10'

window.addEventListener('DOMContentLoaded', async function(){
	if(APP && APP !== undefined){
		APP.innerHTML = await Scenes.Welcome()

		await preload()
		await topFlags()
		await version()
	}
	
	await pageContentAdapter()
})