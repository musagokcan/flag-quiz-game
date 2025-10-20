<?
require_once "./core/config.php";

$language = file_get_contents(_LOCALES._LANG.".json");
$languageARR = json_decode($language, true);

$countries = file_get_contents(_LOCALES._LANG."_countries.json");

$rtl = (_LANG === "ar" || _LANG === "ur") ? true : false;
?>
<!DOCTYPE html>
<html lang="<?=_LANG;?>" <?=$rtl ? "dir=\"rtl\"" : "";?>>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<link rel="stylesheet" type="text/css" href="../public/plugin/css/grid.min.css?v=0.0.10" />
	<link rel="stylesheet" type="text/css" href="../public/plugin/css/reboot.min.css?v=0.0.10" />
	<link rel="stylesheet" type="text/css" href="../public/plugin/css/utilities.min.css?v=0.0.10" />
	<link rel="stylesheet" type="text/css" href="../public/css/style.css?v=0.0.10" />
	<link rel="icon" type="image/x-icon" href="../public/img/favicon.png?v=0.0.10">
	<title><?=$languageARR["main_title"];?> | dyroid</title>
</head>
<body>
	<div id="app"></div>
	<div class="background"></div>

	<script type="text/javascript">
		const _SERVER = '<?=_SERVER;?>';
		const _LANG = '<?=_LANG;?>';
		const l = <?=$language?>;
		const c = <?=$countries?>;
	</script>

	<script type="module" src="../public/js/main.js?v=0.0.10"></script>
</body>
</html>