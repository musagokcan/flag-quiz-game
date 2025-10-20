<?
function get($e){
	if(@$_GET[$e] !== NULL){
		return addslashes(htmlentities(@trim(@$_GET[$e])));
	}
	return false;
}

function post($e){
	if(@$_POST[$e] !== NULL){
		return addslashes(strip_tags(htmlspecialchars(@trim(@$_POST[$e]))));
	}
	return false;
}

function setLanguage(){
	$defaultLanguage = "en";
	$newLanguage = $defaultLanguage;

	preg_match("/([a-zA-Z]+)/", $_SERVER["HTTP_ACCEPT_LANGUAGE"], $matches);
	$browserLanguage = strtolower($matches[1]);

	if(get("language")){
		$currentLanguage = get("language");

		if(file_exists(_LOCALES.$currentLanguage.".json")){
			$newLanguage = $currentLanguage;
		}else if(file_exists(_LOCALES.$browserLanguage.".json")){
			$newLanguage = $browserLanguage;
		}
	}else{
		if(file_exists(_LOCALES.$browserLanguage.".json")){
			$newLanguage = $browserLanguage;
		}
	}

	define("_LANG", $newLanguage);
	$languageFile = _LOCALES._LANG.".json";
	$readLanguageFile = file_get_contents($languageFile);
	$languageFileJSON = json_decode($readLanguageFile, true);

	define("_L", $languageFileJSON);

	if(isset($currentLanguage) AND $currentLanguage !== $newLanguage){
		goDie(_SERVER);
	}
}

function setURL(){
	if(!get("language")){
		header("Location:"._SERVER._LANG."/");
		exit;
	}
}

function goDie($e = NULL){
	header("Location:".($e === NULL ? "./" : $e));
	exit;
}
?>