package com.markhub.repository;

import com.markhub.entity.Project;
import com.markhub.entity.Team;
import com.markhub.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findByTeamOrderByNameAsc(Team team);

    List<Project> findByTeamIdOrderByNameAsc(Long teamId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE Project p SET p.createdBy = :replacement WHERE p.createdBy.id = :userId")
    void reassignCreatedBy(@Param("userId") Long userId, @Param("replacement") User replacement);
}
