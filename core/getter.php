<?
require_once "./config.php";

if(get("getLeaders")){
	$owner = (int)get("owner");

	$result = [];

	$leaderBoardLimit = 10;

	if(get("countryCode")){
		$countryCode = get("countryCode");
		
		$connLeaderBoard = $db->prepare("
			SELECT lb_id, lb_multiplier, lb_points, lb_owner, lb_owner_language
			FROM leaderboard WHERE lb_owner_language = :owner_language
			ORDER BY lb_points DESC LIMIT $leaderBoardLimit
			");
		$connLeaderBoard->bindParam("owner_language", $countryCode, PDO::PARAM_STR);
		$connLeaderBoard->execute();
	}else{
		$connLeaderBoard = $db->prepare("
			SELECT lb_id, lb_multiplier, lb_points, lb_owner, lb_owner_language
			FROM leaderboard
			ORDER BY lb_points DESC LIMIT $leaderBoardLimit
			");
		$connLeaderBoard->execute();
	}

	if($connLeaderBoard->rowCount()){
		$result = $connLeaderBoard->fetchAll(PDO::FETCH_ASSOC);
		if($owner !== 0){
			$filtered = array_filter($result, function($item) use ($owner){
				return $item["lb_id"] == $owner;
			});

			if(!count($filtered) > 0){
				if(get("countryCode")){
					$connOwnerLeaderRank = $db->prepare("
						SELECT COUNT(*)+1 AS lb_rank FROM leaderboard
						WHERE lb_points > (
							SELECT lb_points FROM leaderboard
							WHERE lb_id = :lb_id
							) AND lb_owner_language = :owner_language
						");
					$connOwnerLeaderRank->bindParam("lb_id", $owner, PDO::PARAM_INT);
					$connOwnerLeaderRank->bindParam("owner_language", $countryCode, PDO::PARAM_STR);
					$connOwnerLeaderRank->execute();
				}else{
					$connOwnerLeaderRank = $db->prepare("
						SELECT COUNT(*)+1 AS lb_rank FROM leaderboard
						WHERE lb_points > (
							SELECT lb_points FROM leaderboard
							WHERE lb_id = :lb_id
							)
						");
					$connOwnerLeaderRank->bindParam("lb_id", $owner, PDO::PARAM_INT);
					$connOwnerLeaderRank->execute();
				}

				if($connOwnerLeaderRank->rowCount()){
					$ownerRank = $connOwnerLeaderRank->fetch(PDO::FETCH_ASSOC)["lb_rank"];

					$connOwnerLeader = $db->prepare("
						SELECT lb_id, lb_multiplier, lb_points, lb_owner, lb_owner_language
						FROM leaderboard
						WHERE lb_id = :lb_id
						");
					$connOwnerLeader->bindParam("lb_id", $owner, PDO::PARAM_INT);
					$connOwnerLeader->execute();

					if($connOwnerLeader->rowCount()){
						$ownerLeader = $connOwnerLeader->fetch(PDO::FETCH_ASSOC);
						$ownerLeader = array_merge($ownerLeader, ["lb_rank" => $ownerRank]);
						$result = array_merge($result, [$ownerLeader]);
					}

				}
			}
		}
	}

	echo json_encode([
		"result" => $result
	]);
}else if(get("saveScore")){
	$score_owner = get("score_owner");
	$owner_language = get("owner_language");
	$game_lap = get("game_lap");
	$game_earned_points = get("game_earned_points");
	$game_total_time = get("game_total_time");
	$game_difficulty = get("game_difficulty");
	$game_number_of_fault = get("game_number_of_fault");
	$game_options_amount = get("game_options_amount");
	$game_multiplier = get("game_multiplier");

	if(empty($score_owner) OR strlen($score_owner) <= 5){
		$result = ["type" => "invalid_owner"];
	}else{
		$insertLeader = $db->prepare("
			INSERT INTO leaderboard SET lb_multiplier = :lb_multiplier, lb_points = :lb_points,
			lb_difficulty = :lb_difficulty, lb_number_of_fault = :lb_number_of_fault,
			lb_options_amount = :lb_options_amount, lb_total_time = :lb_total_time, lb_lap = :lb_lap,
			lb_owner = :lb_owner, lb_owner_language = :lb_owner_language
			");
		$insertLeader->bindParam("lb_multiplier", $game_multiplier);
		$insertLeader->bindParam("lb_points", $game_earned_points);
		$insertLeader->bindParam("lb_difficulty", $game_difficulty, PDO::PARAM_STR);
		$insertLeader->bindParam("lb_number_of_fault", $game_number_of_fault, PDO::PARAM_INT);
		$insertLeader->bindParam("lb_options_amount", $game_options_amount, PDO::PARAM_INT);
		$insertLeader->bindParam("lb_total_time", $game_total_time, PDO::PARAM_INT);
		$insertLeader->bindParam("lb_lap", $game_lap, PDO::PARAM_INT);
		$insertLeader->bindParam("lb_owner", $score_owner);
		$insertLeader->bindParam("lb_owner_language", $owner_language, PDO::PARAM_STR);
		$insertLeader->execute();

		if($insertLeader->rowCount()){
			$lastInsertID = $db->lastInsertId();
			$result = ["type" => "success", "data" => ["lb_id" => $lastInsertID]];
		}else{
			$result = ["type" => "error"];
		}
	}

	echo json_encode([
		"result" => $result
	]);
}else if(get("contact")){
	$contact_email = get("contact_email");
	$contact_message = get("contact_message");
	$contact_language = get("contact_language");

	if(empty($contact_email) OR !filter_var($contact_email, FILTER_VALIDATE_EMAIL)){
		$result = ["type" => "invalid_email"];
	}else{
		$insertContact = $db->prepare("
			INSERT INTO contact SET contact_email = :contact_email, contact_message = :contact_message,
			contact_language = :contact_language
			");
		$insertContact->bindParam("contact_email", $contact_email, PDO::PARAM_STR);
		$insertContact->bindParam("contact_message", $contact_message, PDO::PARAM_STR);
		$insertContact->bindParam("contact_language", $contact_language, PDO::PARAM_STR);
		$insertContact->execute();

		if($insertContact->rowCount()){
			$result = ["type" => "success"];
		}else{
			$result = ["type" => "error"];
		}
	}

	echo json_encode([
		"result" => $result
	]);
}
?>