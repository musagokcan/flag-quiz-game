<?
session_start();
ob_start();

define("_SERVER", "https://localhost/dyroid/");
define("_ROOT", dirname(__DIR__)."/");
define("_CORE", _ROOT."core/");
define("_COMM", _ROOT."comm/");

define("_LOCALES", _COMM."locales/");

require_once _CORE."funcs.php";

setLanguage();
setURL();
?>