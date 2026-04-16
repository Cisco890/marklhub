package com.markhub.repository;

import com.markhub.entity.Team;
import com.markhub.entity.TeamMember;
import com.markhub.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TeamMemberRepository extends JpaRepository<TeamMember, Long> {

    boolean existsByUserAndTeam(User user, Team team);

    Optional<TeamMember> findByUserAndTeam(User user, Team team);

    @Query("SELECT tm.team FROM TeamMember tm WHERE tm.user.id = :userId")
    List<Team> findTeamsByUserId(@Param("userId") Long userId);

    @Query("SELECT COUNT(tm) > 0 FROM TeamMember tm WHERE tm.user.id = :userId AND tm.team.id = :teamId")
    boolean isUserMemberOfTeam(@Param("userId") Long userId, @Param("teamId") Long teamId);

    @Query("SELECT tm.user FROM TeamMember tm WHERE tm.team.id = :teamId ORDER BY tm.user.username ASC")
    List<User> findUsersByTeamId(@Param("teamId") Long teamId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM TeamMember tm WHERE tm.user.id = :userId")
    void deleteAllByUserId(@Param("userId") Long userId);
}
